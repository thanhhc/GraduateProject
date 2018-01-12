using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CRP.Controllers;
using CRP.Models;
using CRP.Models.Entities;
using CRP.Models.Entities.Services;
using CRP.Models.ViewModels;

namespace CRP.Helpers
{
	public class Searcher : BaseController
	{
		public SearchResultJsonModel SearchVehicle(SearchConditionModel filterConditions, AspNetUser user)
		{
			var vehicleService = this.Service<IVehicleService>();

			// Get all available vehicles
			var vehicles = vehicleService.Get(v => !v.IsDeleted
										&& v.Garage.IsActive
										&& v.Garage.AspNetUser.AspNetRoles.Any(r => r.Name == "Provider")
										&& (v.Garage.AspNetUser.LockoutEndDateUtc == null || v.Garage.AspNetUser.LockoutEndDateUtc < DateTime.UtcNow)
										&& v.VehicleGroup != null
										&& v.VehicleGroup.IsActive);

			// Normal filtering, GO!!
			// ===========================================================================
			// Transmission condition
			if (filterConditions.TransmissionTypeIDList != null)
				vehicles = vehicles.Where(v => filterConditions.TransmissionTypeIDList.Contains(v.TransmissionType));

			// Color condition
			if (filterConditions.ColorIDList != null)
				vehicles = vehicles.Where(v => filterConditions.ColorIDList.Contains(v.Color));

			// FuelType condition
			if (filterConditions.FuelTypeIDList != null)
				vehicles = vehicles.Where(v => filterConditions.FuelTypeIDList.Contains(v.FuelType));

			// Location condition
			if (filterConditions.LocationID != null)
				vehicles = vehicles.Where(v => filterConditions.LocationID == v.Garage.LocationID);

			// Category condition
			if (filterConditions.CategoryIDList != null)
				vehicles = vehicles.Where(v => v.VehicleModel.Categories.Any(r => filterConditions.CategoryIDList.Contains(r.ID)));

			// Max/Min ProductionYear condition
			// Do not validate Max > Min here. Do it before this in the controller
			if (filterConditions.MaxProductionYear != null && filterConditions.MinProductionYear != null)
				vehicles = vehicles.Where(v => v.Year <= filterConditions.MaxProductionYear
											&& v.Year >= filterConditions.MinProductionYear);

			// Max/Min GarageRating condition
			if (filterConditions.MinGarageRating != null)
				vehicles = vehicles.Where(v => v.Garage.Star >= filterConditions.MinGarageRating);

			// Max/Min VehicleRating condition
			if (filterConditions.MinVehicleRating != null)
				vehicles = vehicles.Where(v => v.Star >= filterConditions.MinVehicleRating);

			// Brand and Model condition
			if (filterConditions.BrandIDList.Any() || filterConditions.ModelIDList.Any())
				vehicles = vehicles.Where(v => filterConditions.BrandIDList.Contains(v.VehicleModel.BrandID)
											|| filterConditions.ModelIDList.Contains(v.ModelID));

			// NumOfSeatList condition
			if (filterConditions.NumberOfSeatList != null)
				vehicles = vehicles.Where(v => filterConditions.NumberOfSeatList.Contains(v.VehicleModel.NumOfSeat));

			// Get the rental time in hour
			var rentalTimeSpan = (DateTime)filterConditions.EndTime - (DateTime)filterConditions.StartTime;
			var rentalTime = (int)Math.Ceiling(rentalTimeSpan.TotalHours);

			// vehicleGroup's max rental time constraint
			vehicles = vehicles.Where(v => v.VehicleGroup.PriceGroup.MaxRentalPeriod == null
										|| v.VehicleGroup.PriceGroup.MaxRentalPeriod * 24 > rentalTime);

			// get only vehicles that are free in the booking period condition
			// also add in-between-booking's rest time to filter's time
			var startTimeMinuteRest = filterConditions.StartTime.Value
					.AddHours(-Constants.IN_BETWEEN_BOOKING_REST_TIME_IN_HOUR);
			var endTimePlusRest = filterConditions.EndTime.Value
					.AddHours(Constants.IN_BETWEEN_BOOKING_REST_TIME_IN_HOUR);

			vehicles = vehicles.Where(v =>
				!(v.BookingReceipts.Any(br => !br.IsCanceled
					&& (
						   (startTimeMinuteRest > br.StartTime
							&& startTimeMinuteRest < br.EndTime)
						|| (endTimePlusRest > br.StartTime
							&& endTimePlusRest < br.EndTime)
						|| (startTimeMinuteRest <= br.StartTime
							&& endTimePlusRest >= br.EndTime)
					)))
			);

			// Check StartTime/EndTime to be within garage's OpenTime ~ CloseTime
			// Compare by convert time to the number of minute from 00:00
			// Max margin of error: 60 secs w/ CloseTime (Because we do not validate to second)

			// Booking StartTime
			var startDayInDoW = (int)filterConditions.StartTime.Value.DayOfWeek;
			var startTimeInMunute = filterConditions.StartTime.Value.Minute + filterConditions.StartTime.Value.Hour * 60;
			vehicles = vehicles.Where(v =>
				v.Garage.GarageWorkingTimes.Any(gwt => gwt.DayOfWeek == startDayInDoW
							  && startTimeInMunute >= gwt.OpenTimeInMinute
							  && startTimeInMunute <= gwt.CloseTimeInMinute)
			);

			// Booking EndTime
			var endDayInDoW = (int)filterConditions.EndTime.Value.DayOfWeek;
			var endTimeInMunute = filterConditions.EndTime.Value.Minute + filterConditions.EndTime.Value.Hour * 60;
			vehicles = vehicles.Where(v =>
				v.Garage.GarageWorkingTimes.Any(gwt => gwt.DayOfWeek == endDayInDoW
							  && endTimeInMunute >= gwt.OpenTimeInMinute
							  && endTimeInMunute <= gwt.CloseTimeInMinute)
			);

			// Parse into models suitable to run recommendation algor
			var vehicleList2 = vehicles.ToList().Select(vehicle => new VehicleFilterModel(vehicle, rentalTime));

			// Max/Min Price conditions
			// Do not validate MaxPrice > MinPrice here. Do it before this in the controller
			if (filterConditions.MaxPrice != null
				&& filterConditions.MinPrice != null)
			{
				vehicleList2 = vehicleList2.Where(
					r => filterConditions.MaxPrice >= r.BestPossibleRentalPrice
						&& filterConditions.MinPrice <= r.BestPossibleRentalPrice
				);
			}

			// All normal filterings passed
			// Calc the average rental price and rental period
			double? averagePrice = null, averagePeriod = null;
			if (vehicleList2.Any())
			{
				averagePrice = vehicleList2.Average(r => r.BestPossibleRentalPrice);
				averagePeriod = vehicleList2.Average(r => r.BestPossibleRentalPeriod);
			}

			// recommender's job coming
			// =============================================================================================
			if (user != null)
			{
				var recommender = new Recommender();
				vehicleList2 = recommender.CalculateRecommendScoreForSearchResults(vehicleList2.ToList(), user);
			}


			// =============================================================================================
			// Sorting
			// Validate OrderBy in the controller
			if (filterConditions.OrderBy == null)
			{
				// Default ordering is by BestPossibleRentalPeriod
				// then by descending RecommendScore
				vehicleList2 = vehicleList2.OrderBy(r => r.BestPossibleRentalPeriod)
								.ThenByDescending(r => r.RecommendScore);
			}
			else
			{
				var sortingProp = typeof(VehicleFilterModel).GetProperty(filterConditions.OrderBy);

				// Ensure that the magical strings represent attribute name exist
				// Always order descendingly by RecommendScore at the end
				if (filterConditions.IsDescendingOrder)
				{
					vehicleList2 = vehicleList2.OrderByDescending(r => sortingProp.GetValue(r))
												.ThenByDescending(r => r.RecommendScore);
				}
				else
				{
					vehicleList2 = vehicleList2.OrderBy(r => sortingProp.GetValue(r))
									.ThenByDescending(r => r.RecommendScore);
				}
			}

			// Paginate
			var filteredRecords = vehicleList2.Count();
			if (filterConditions.Page < 1 || (filterConditions.Page - 1) * filterConditions.RecordPerPage > filteredRecords)
				filterConditions.Page = 1;

			vehicleList2 = vehicleList2.Skip((filterConditions.Page - 1) * filterConditions.RecordPerPage)
							 .Take(filterConditions.RecordPerPage);

			// Parse the list into a new one that can be sent back as json
			var filterResults = vehicleList2.Select(v => new SearchResultItemJsonModel(v));

			// Nest into result object
			return new SearchResultJsonModel(filterResults.ToList(), averagePrice, averagePeriod, filteredRecords, filterConditions.Page);
		}
	}
}