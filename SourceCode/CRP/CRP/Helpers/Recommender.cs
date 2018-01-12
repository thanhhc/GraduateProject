using System;
using System.Collections.Generic;
using System.Linq;
using CRP.Controllers;
using CRP.Models;
using CRP.Models.Entities;
using CRP.Models.Entities.Services;
using CRP.Models.ViewModels;

namespace CRP.Helpers
{
	public class Recommender : BaseController
	{
		public List<VehicleFilterModel> CalculateRecommendScoreForSearchResults(List<VehicleFilterModel> vehicleList, AspNetUser user)
		{
			// Remove self-booking from bookinghistory
			user.BookingReceipts = user.BookingReceipts.Where(br => br.CustomerID != br.Garage.OwnerID).ToList();

			// If there is no booking, go no further
			if (!user.BookingReceipts.Any())
				return vehicleList;
			
			var brandList = this.Service<IBrandService>().Get().ToList();
			var categoryList = this.Service<ICategoryService>().Get().ToList();
			var modelService = this.Service<IModelService>();
			var numOfSeatList = modelService.Get().Select(m => m.NumOfSeat).Distinct().Where(s => s != 0).ToList();
			var numOfDoorList = modelService.Get().Select(m => m.NumOfDoor).Distinct().Where(s => s != 0).ToList();

			// Get the list of userIds of users that has booked a same vehicle with this user.
			// Do not count self-booking
			// Exclude this user
			var neighborIdList = user.BookingReceipts
					.SelectMany(b => b.Vehicle.BookingReceipts
										.Where(br => br.CustomerID != user.Id
													&& br.CustomerID != br.Garage.OwnerID)
										.Select(br => br.CustomerID))
					.Distinct()
					.ToList();

			// Calc num of attribute
			var numOfAttribute = Constants.TRANSMISSION_TYPE.Count
			                     + Constants.FUEL_TYPE.Count
			                     + Constants.COLOR.Count
								 + numOfSeatList.Count
								 + numOfDoorList.Count
								 + brandList.Count
			                     + categoryList.Count
			                     + neighborIdList.Count;

			// Build user profile from his booking history
			var userProfile = BuildUserProfile(user, brandList, categoryList,
											numOfSeatList,
											numOfDoorList,
											neighborIdList,
											numOfAttribute);

			// Build the attribute vectors for each vehicle
			vehicleList = BuildVehicleVectorList(vehicleList, brandList, categoryList,
												numOfSeatList,
												numOfDoorList,
												neighborIdList,
												numOfAttribute);
			
			var profileNorm = Math.Sqrt(userProfile.Sum(av => av * av));
			// Finally, score the items in itemList
			foreach (var item in vehicleList)
			{
				var dotProduct = item.AttributeVectorList.Zip(userProfile, (av1, av2) => av1 * av2).Sum();
				var vehicleNorm = Math.Sqrt(item.AttributeVectorList.Sum(av => av*av));
				item.RecommendScore = dotProduct/(profileNorm*vehicleNorm);
			}

			return vehicleList;
		}

		#region SupportMethods

		private static List<double> BuildUserProfile(AspNetUser user,
											IReadOnlyCollection<VehicleBrand> brandList,
											IReadOnlyCollection<Category> categoryList,
											IReadOnlyCollection<int> numOfSeatList,
											IReadOnlyCollection<int> numOfDoorList,
											IReadOnlyCollection<string> neighborIdList,
											int numOfAttribute)
		{
			// Calculate attribute vectors for each booking
			var bookingList = user.BookingReceipts
				.Select(booking => GenerateAttributeVectorsOfBooking(booking,
																	neighborIdList,
																	numOfSeatList,
																	numOfDoorList,
																	brandList,
																	categoryList,
																	numOfAttribute))
				.ToList();

			// Build user profile by calc each attribute vector
			var userProfile = new List<double>();
			for (var i = 0; i < numOfAttribute; i++)
			{
				var df = bookingList.Count(b => !b[i].Equals(0));
				var idf = Math.Log10((double)bookingList.Count / (df + 1));

				// Sum of booking's i tf
				var sumBookingTf = bookingList.Sum(b => b[i]);
				double tf;
				if (sumBookingTf.Equals(0))
					tf = 0;
				else if (sumBookingTf > 0)
					tf = 1 + Math.Log10(sumBookingTf);
				else
					tf = -1 - Math.Log10(-sumBookingTf);

				// Calc attribute vector i of profile using tf-idf
				userProfile.Add(tf * idf);
			}

			return userProfile;
		}

		// Calc the attribute vectors of an user's booking
		private static List<double> GenerateAttributeVectorsOfBooking(BookingReceipt booking,
															IEnumerable<string> neighborIdList,
															IEnumerable<int> numOfSeatList,
															IEnumerable<int> numOfDoorList,
															IEnumerable<VehicleBrand> brandList,
															IEnumerable<Category> categoryList,
															int numOfAttribute)
		{
			var vectorList = new List<double>();

			// Apply user's interest
			double interestPoint;
			if (booking.Star == null || booking.Star == 3)
			{
				// All attribute equal 0 now
				for (var i = 0; i < numOfAttribute; i++)
				{
					vectorList.Add(0);
				}
				return vectorList;
			}
			else if (booking.Star > 3)
			{
				interestPoint = 1; // star > 3
			}
			else
			{
				interestPoint = -1; // star < 3
			}

			// TranmissionType Attributes
			vectorList.AddRange(Constants.TRANSMISSION_TYPE.Select(attribute => booking.Vehicle.TransmissionType == attribute.Key ? interestPoint : 0).ToList());

			// FuelType Attributes
			vectorList.AddRange(Constants.FUEL_TYPE.Select(attribute => booking.Vehicle.FuelType == attribute.Key ? interestPoint : 0));

			// Color Attributes
			vectorList.AddRange(Constants.COLOR.Select(attribute => booking.Vehicle.Color == attribute.Key ? interestPoint : 0));

			// NumOfSeat Attributes
			vectorList.AddRange(numOfSeatList.Select(attribute => booking.Vehicle.VehicleModel.NumOfSeat == attribute ? interestPoint : 0));

			// NumOfDoor Attributes
			vectorList.AddRange(numOfDoorList.Select(attribute => booking.Vehicle.VehicleModel.NumOfDoor == attribute ? interestPoint : 0));

			// Brand Attributes
			vectorList.AddRange(brandList.Select(attribute => booking.Vehicle.VehicleModel.BrandID == attribute.ID ? interestPoint : 0));

			// Category Attributes
			vectorList.AddRange(categoryList.Select(attribute => booking.Vehicle.VehicleModel.Categories.Contains(attribute) ? interestPoint : 0));

			// Similar user attributes.
			vectorList.AddRange(neighborIdList.Select(attribute => booking.Vehicle.BookingReceipts.Any(b => b.CustomerID == attribute) ? interestPoint : 0));

			return vectorList;
		}

		private static List<VehicleFilterModel> BuildVehicleVectorList(List<VehicleFilterModel> vehicleList,
															IReadOnlyCollection<VehicleBrand> brandList,
															IReadOnlyCollection<Category> categoryList,
															IReadOnlyCollection<int> numOfSeatList,
															IReadOnlyCollection<int> numOfDoorList,
															IReadOnlyCollection<string> neighborIdList,
															int numOfAttribute)
		{
			// Build attribute vectors for each vehicle
			foreach (var vehicle in vehicleList)
			{
				vehicle.AttributeVectorList = GenerateAttributeVectorsOfVehicle(vehicle,
																		neighborIdList,
																		numOfSeatList,
																		numOfDoorList,
																		brandList,
																		categoryList);
			}

			// Apply df-idf
			for (var i = 0; i < numOfAttribute; i++)
			{
				var df = vehicleList.Count(v => v.AttributeVectorList[i].Equals(1));
				var idf = Math.Log10((double)vehicleList.Count / (df + 1));

				// Calc attribute vector i of profile using tf-idf
				foreach (var vehicle in vehicleList)
				{
					vehicle.AttributeVectorList[i] *= idf;
				}
			}

			return vehicleList;
		}

		// Calc the attribute vectors of a vehicle
		private static List<double> GenerateAttributeVectorsOfVehicle(VehicleFilterModel vehicle,
															IEnumerable<string> neighborIdList,
															IEnumerable<int> numOfSeatList,
															IEnumerable<int> numOfDoorList,
															IEnumerable<VehicleBrand> brandList,
															IEnumerable<Category> categoryList)
		{
			// TranmissionType Attributes
			var vectorList = Constants.TRANSMISSION_TYPE.Select(attribute => vehicle.TransmissionType == attribute.Key ? 1.0 : 0).ToList();

			// FuelType Attributes
			vectorList.AddRange(Constants.FUEL_TYPE.Select(attribute => vehicle.FuelType == attribute.Key ? 1.0 : 0));

			// Color Attributes
			vectorList.AddRange(Constants.COLOR.Select(attribute => vehicle.Color == attribute.Key ? 1.0 : 0));

			// NumOfSeat Attributes
			vectorList.AddRange(numOfSeatList.Select(attribute => vehicle.NumOfSeat == attribute ? 1.0 : 0));

			// NumOfDoor Attributes
			vectorList.AddRange(numOfDoorList.Select(attribute => vehicle.NumOfDoor == attribute ? 1.0 : 0));

			// Brand Attributes
			vectorList.AddRange(brandList.Select(attribute => vehicle.BrandID == attribute.ID ? 1.0 : 0));

			// Category Attributes
			vectorList.AddRange(categoryList.Select(attribute => vehicle.Categories.Contains(attribute) ? 1.0 : 0));

			// Similar user attributes.
			vectorList.AddRange(neighborIdList.Select(neighborId => vehicle.CustomerIdList.Any(id => id == neighborId) ? 1.0 : 0));

			return vectorList;
		}

		#endregion

	}

	// Model to filter the vehicle in search
	public class VehicleFilterModel : VehicleRecordJsonModel
	{
		public string Location { get; set; }
		public string GarageName { get; set; }
		public int GarageNumOfComment { get; set; }
		public decimal GarageRating { get; set; }
		public string TransmissionTypeName { get; set; }
		public string FuelTypeName { get; set; }
		public int NumOfDoor { get; set; }
		public List<string> CategoryList { get; set; }
		public List<string> ImageList { get; set; }
		// Shortest rental period of this vehicle that fit the filter
		public int BestPossibleRentalPeriod { get; set; }
		// Lowest price range of this vehicle that fit the filter
		public double BestPossibleRentalPrice { get; set; }


		public int TransmissionType { get; set; }
		public int? FuelType { get; set; }
		public int? Color { get; set; }
		public int BrandID { get; set; }
		public List<Category> Categories { get; set; }
		public List<string> CustomerIdList { get; set; }

		// Attribute vectors
		public List<double> AttributeVectorList { get; set; }

		// Recommender's scored result
		public double RecommendScore { get; set; }

		public VehicleFilterModel(Vehicle vehicle, int rentalTime) : base(vehicle)
		{
			Location = vehicle.Garage.Location.Name;
			GarageName = vehicle.Garage.Name;
			GarageNumOfComment = vehicle.Garage.NumOfComment;
			GarageRating = vehicle.Garage.Star;
			TransmissionType = vehicle.TransmissionType;
			FuelType = vehicle.FuelType;
			Color = vehicle.Color;
			NumOfDoor = vehicle.VehicleModel.NumOfDoor;
			BrandID = vehicle.VehicleModel.BrandID;
			Categories = vehicle.VehicleModel.Categories.ToList();

			ImageList = vehicle.VehicleImages.Select(i => i.URL).ToList();

			TransmissionTypeName = Constants.TRANSMISSION_TYPE[vehicle.TransmissionType];
			FuelTypeName = vehicle.FuelType == null ? null : Constants.FUEL_TYPE[vehicle.FuelType.Value];

			// Get the list of userid of users that has booked this vehicle
			// Exclude the owner
			CustomerIdList = vehicle.BookingReceipts
					.Where(b => b.CustomerID != vehicle.Garage.OwnerID)
					.Select(b => b.CustomerID)
					.Distinct()
					.ToList();

			// Find the best PriceGroupItem that match the search
			var items = vehicle.VehicleGroup.PriceGroup.PriceGroupItems.OrderBy(x => x.MaxTime);
			foreach (var item in items)
			{
				if (item.MaxTime >= rentalTime)
				{
					BestPossibleRentalPeriod = item.MaxTime;
					BestPossibleRentalPrice = item.Price;
					break;
				}
			}
			// If not found, use the PerDayPrice
			if (BestPossibleRentalPrice.CompareTo(0) == 0)
			{
				BestPossibleRentalPeriod = 24;
				BestPossibleRentalPrice = vehicle.VehicleGroup.PriceGroup.PerDayPrice;
			}
		}
	}
}

