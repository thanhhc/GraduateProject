using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CRP.Models.Entities;
using System.Text.RegularExpressions;

namespace CRP.Models.ViewModels
{
	// Input model for TryCreateAPI in BookingController
	public class BookingCreatingModel
	{
		public int? VehicleID { get; set; }
		public DateTime StartTime { get; set; }
		public int? RentalType { get; set; }
		public int? NumOfDay { get; set; }
	}

	// ViewModel for BookingConfirm
	public class BookingConfirmViewModel
	{
		public string Action { get; set; }
		public BookingReceipt Receipt { get; set; }
		public NganLuongPaymentModel NganLuong { get; set; }
	}

	// Json model to populate booking history datatable
	public class BookingHistoryDataTablesModel
	{
		public List<BookingHistoryDataTablesRecordModel> data { get; set; }
		public int draw { get; set; }
		public int recordsTotal { get; set; }
		public int recordsFiltered { get; set; }

		public BookingHistoryDataTablesModel(List<BookingReceipt> brList, int drawID, int total)
		{
			data = brList.Select(br => new BookingHistoryDataTablesRecordModel(br)).ToList();
			draw = drawID;
			recordsFiltered = recordsTotal = total;
		}

		// Model of each record
		public class BookingHistoryDataTablesRecordModel
		{
			public int ID { get; set; }
			public double RentalPrice { get; set; }
			public double Deposit { get; set; }
			public double BookingFee { get; set; }
			public int? Distance { get; set; }
			public bool HasStar { get; set; }
			public string StartTime { get; set; }
			public string EndTime { get; set; }
			public bool IsCanceled { get; set; }
			public string GarageName { get; set; }
			public string GarageAddress { get; set; }
			public string GaragePhone { get; set; }
			public string GarageEmail { get; set; }
			public int? VehicleID { get; set; }
			public string VehicleName { get; set; }
			public int Year { get; set; }
			public int NumOfSeat { get; set; }
			public int NumOfDoor { get; set; }
			public string TransmissionType { get; set; }
			public string TransmissionDetail { get; set; }
			public string FuelType { get; set; }
			public string Engine { get; set; }
			public string Color { get; set; }

			public BookingHistoryDataTablesRecordModel(BookingReceipt br)
			{
				ID = br.ID;
				RentalPrice = br.RentalPrice;
				Deposit = br.Deposit;
				BookingFee = br.BookingFee;
				Distance = br.Distance;
				HasStar = br.Star.HasValue;
				StartTime = br.StartTime.ToUniversalTime().ToString("o");
				EndTime = br.EndTime.ToUniversalTime().ToString("o");
				IsCanceled = br.IsCanceled;
				GarageName = br.GarageName;
				GarageAddress = br.GarageAddress;
				GaragePhone = br.GaragePhone;
				GarageEmail = br.GarageEmail;
				VehicleID = br.VehicleID;
				VehicleName = br.VehicleName;
				Year = br.Vehicle.Year;
				NumOfSeat = br.Vehicle.VehicleModel.NumOfSeat;
				NumOfDoor = br.Vehicle.VehicleModel.NumOfDoor;
				TransmissionType = Constants.TRANSMISSION_TYPE[br.Vehicle.TransmissionType];
				TransmissionDetail = br.TransmissionDetail;
				FuelType = br.Vehicle.FuelType == null ? null : Constants.FUEL_TYPE[br.Vehicle.FuelType.Value];
				Engine = Engine;
				Color = Constants.COLOR[br.Color];
			}
		}
	}

	public class BookingCommentModel
	{
		public int ID { get; set; }
		public int Star { get; set; }
		public string Comment { get; set; }

		public static readonly int MAX_RATING = 5;
		public static readonly int MIN_RATING = 0;
		public static readonly int MAX_COMMENT_LENGTH = 200;
		public static readonly int MIN_COMMENT_LENGTH = 20;
	}

	public class BookingsRecordJsonModel
	{
		public int ID { get; set; }
		public string CustomerName { get; set; }
		public string CustomertEmail { get; set; }
		public string CustomerPhone { get; set; }
		public int? VehicleID { get; set; }
		public string VehicleName { get; set; }
		public string LicenseNumber { get; set; }
		public double RentalPrice { get; set; }
        public double Deposit { get; set; }
		public DateTime StartTime { get; set; }
		public DateTime EndTime { get; set; }
		public int? Star { get; set; }
		public string Comment { get; set; }
		public bool IsInThePast { get; set; }
		public bool IsCanceled { get; set; }
		public bool IsSelfBooking { get; set; }
		public BookingsRecordJsonModel(BookingReceipt receipt)
		{
			ID = receipt.ID;
			CustomerName = receipt.AspNetUser.FullName;
			CustomertEmail = receipt.AspNetUser.Email;
			CustomerPhone = receipt.AspNetUser.PhoneNumber;
			VehicleID = receipt.VehicleID;
			VehicleName = receipt.VehicleName;
			LicenseNumber = receipt.LicenseNumber;
			RentalPrice = receipt.RentalPrice;
            Deposit = receipt.Deposit;
			StartTime = receipt.StartTime;
			EndTime = receipt.EndTime;
			Star = receipt.Star;
            Comment = receipt.Comment != null ? Regex.Replace(receipt.Comment, @"\r\n?|\n", "<br>"): null;

			DateTime now = DateTime.Now;
			if(receipt.StartTime < now)
			{
				IsInThePast = true;
			} else
			{
				IsInThePast = false;
			}

			IsCanceled = receipt.IsCanceled;
			IsSelfBooking = receipt.Garage.OwnerID == receipt.CustomerID;
		}
	}

	public class BookingsDataTablesJsonModel
	{
		public List<BookingsRecordJsonModel> data { get; set; }
		public int draw { get; set; }
		public int recordsTotal { get; set; }
		public int recordsFiltered { get; set; }

		public BookingsDataTablesJsonModel(List<BookingsRecordJsonModel> bookingList, int rDraw, int totalRecords, int FilteredRecords)
		{
			data = bookingList;
			draw = rDraw;
			recordsTotal = totalRecords;
			recordsFiltered = FilteredRecords;
		}
	}

	public class BookingsFilterConditions
	{
		public string providerID { get; set; }
		public int? vehicleID { get; set; }
		public int? garageID { get; set; }
		public bool IsCanceled { get; set; }
		public bool? IsInThePast { get; set; }
		public bool IsSelfBooking { get; set; }

        public string Search { get; set; }
		public string OrderBy { get; set; }
		public bool IsDescendingOrder { get; set; }
		public int Page { get; set; } = 1;
		public int RecordPerPage { get; set; } = Constants.NUM_OF_SEARCH_RESULT_PER_PAGE;
		public int Draw { get; set; }
	}
}