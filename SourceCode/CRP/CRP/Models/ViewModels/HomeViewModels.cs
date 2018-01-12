using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CRP.Helpers;
using CRP.Models;
using CRP.Models.Entities;

namespace CRP.Models.ViewModels
{
	// Model to populate the filters in search page
	public class SearchPageViewModel
	{
		public List<VehicleBrand> BrandList { get; set; }
		public List<int> NumOfSeatList { get; set; }
		public List<Category> CategoryList { get; set; }
		public List<Location> LocationList { get; set; }
		public double MaxPrice { get; set; }
		public string MaxPriceUnit { get; set; }
		public double MinPrice { get; set; }
		public string MinPriceUnit { get; set; }
		public int MaxYear { get; set; }
		public int MinYear { get; set; }
	}

	//// Model to populate the vehicle info page
	//public class VehicleInfoPageViewModel
	//{
	//	public Vehicle Vehicle { get; set; }
	//	public int NumOfComment { get; set; }

	//	public VehicleInfoPageViewModel(Vehicle vehicle)
	//	{
	//		Vehicle = vehicle;
	//		//
	//		//
	//	}
	//}

	// Model to map the search request
	// Use as input for route ~/api/vehicles/search/ of HomeController
	public class SearchConditionModel
	{
		public int[] NumberOfSeatList { get; set; }
		public DateTime? StartTime { get; set; }
		public DateTime? EndTime { get; set; }
		public double? MaxPrice { get; set; }
		public double? MinPrice { get; set; }
		public int[] TransmissionTypeIDList { get; set; }
		public int[] ColorIDList { get; set; }
		public int?[] FuelTypeIDList { get; set; }
		public int? LocationID { get; set; }
		public int[] CategoryIDList { get; set; }
		public decimal? MinVehicleRating { get; set; }
		public decimal? MinGarageRating { get; set; }
		public int? MaxProductionYear { get; set; }
		public int? MinProductionYear { get; set; }
		public int[] BrandIDList { get; set; } = new int[0];
		public int[] ModelIDList { get; set; } = new int[0];

		public string OrderBy { get; set; }
		public bool IsDescendingOrder { get; set; }
		public int Page { get; set; } = 1;
		public int RecordPerPage { get; set; } = Constants.NUM_OF_SEARCH_RESULT_PER_PAGE;
	}

	// Returned json model for route ~/api/vehicles/search/ of HomeController
	public class SearchResultJsonModel : IVehicleFilterJsonModel
	{
		public List<SearchResultItemJsonModel> SearchResultList { get; set; }
		public int CurrentPage { get; set; }
		public int TotalResult { get; set; }
		public int TotalPage { get; set; }
		public double? AveragePrice { get; set; }
		public double? AveragePeriod { get; set; }

		public SearchResultJsonModel(List<SearchResultItemJsonModel> searchResultList, double? averagePrice, double? averagePeriod, int totalResult, int currentPage)
		{
			if (!searchResultList.Any()) return;

			SearchResultList = searchResultList;
			CurrentPage = currentPage;
			TotalResult = totalResult;
			TotalPage = (int)Math.Ceiling((float)totalResult / Constants.NUM_OF_SEARCH_RESULT_PER_PAGE);
			AveragePrice = averagePrice;
			AveragePeriod = averagePeriod;
		}
	}

	// Model of JSON object of search result for searching vehicle to book
	public class SearchResultItemJsonModel
	{
		public int ID { get; set; }
		public string LicenseNumber { get; set; }
		public string Name { get; set; }
		public int? Year { get; set; }
		public string Location { get; set; }
		public string GarageName { get; set; }
		public int GarageNumOfComment { get; set; }
		public decimal GarageRating { get; set; }
		public string TransmissionTypeName { get; set; }
		public string FuelTypeName { get; set; }
		public int NumOfSeat { get; set; }
		public int NumOfComment { get; set; }
		public decimal? Star { get; set; }
		public List<string> ImageList { get; set; }
		// Shortest rental period of this vehicle that fit the filter
		public int BestPossibleRentalPeriod { get; set; }
		// Lowest price range of this vehicle that fit the filter
		public double BestPossibleRentalPrice { get; set; }

		public SearchResultItemJsonModel(VehicleFilterModel vehicle)
		{
			ID = vehicle.ID;
			LicenseNumber = vehicle.LicenseNumber;
			Name = vehicle.Name;
			Year = vehicle.Year;
			Location = vehicle.Location;
			GarageName = vehicle.GarageName;
			GarageNumOfComment = vehicle.GarageNumOfComment;
			GarageRating = vehicle.GarageRating;

			TransmissionTypeName = vehicle.TransmissionTypeName;
			FuelTypeName = vehicle.FuelTypeName;
			NumOfSeat = vehicle.NumOfSeat;
			NumOfComment = vehicle.NumOfComment;
			Star = vehicle.Star;
			ImageList = vehicle.ImageList;

			BestPossibleRentalPeriod = vehicle.BestPossibleRentalPeriod;
			BestPossibleRentalPrice = vehicle.BestPossibleRentalPrice;
		}
	}
}