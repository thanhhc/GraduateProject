using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.AccessControl;
using System.Security.Cryptography.Xml;
using System.Web.Mvc;
using CRP.Models.Entities;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace CRP.Models.ViewModels
{
	// Model for creating vehicle
	public class CreateVehicleModel
	{
		public string LicenseNumber { get; set; }
		public string Name { get; set; }
		public int Year { get; set; }
		public int ModelID { get; set; }
		public int GarageID { get; set; }
		public int? VehicleGroupID { get; set; }
		public int TransmissionType { get; set; }
		public string TransmissionDetail { get; set; }
		public int? FuelType { get; set; }
		public string Engine { get; set; }
		public int Color { get; set; }
		public string Description { get; set; }
	}

	// Model for editing vehicle
	public class EditVehicleModel
	{
		public string LicenseNumber { get; set; }
		public string Name { get; set; }
		public int GarageID { get; set; }
		public int? VehicleGroupID { get; set; }
		public string TransmissionDetail { get; set; }
		public string Engine { get; set; }
		public int Color { get; set; }
		public string Description { get; set; }
	}

	// Model for containing vehicle datatables filtering conditions
	public class VehicleManagementFilterConditionModel
	{
		public string ProviderID { get; set; }
		public int? GarageID { get; set; }
		public int? VehicleGroupID { get; set; }

		public string Search { get; set; }
		public string OrderBy { get; set; }
		public bool IsDescendingOrder { get; set; }
		public int Page { get; set; } = 1;
		public int RecordPerPage { get; set; } = Constants.NUM_OF_SEARCH_RESULT_PER_PAGE;
		public int Draw { get; set; }
	}

	public interface IVehicleFilterJsonModel { }

	public class VehicleDataTablesJsonModel : IVehicleFilterJsonModel
	{
		public List<VehicleManagementItemJsonModel> data { get; set; }
		public int draw { get; set; }
		public int recordsTotal { get; set; }
		public int recordsFiltered { get; set; }

		public VehicleDataTablesJsonModel(List<VehicleManagementItemJsonModel> vehicleList, int rDraw, int totalRecords, int filteredRecords)
		{
			data = vehicleList;
			draw = rDraw;
			recordsTotal = totalRecords;
			recordsFiltered = filteredRecords;
		}
	}

	public abstract class VehicleRecordJsonModel
	{
		public int ID { get; set; }
		public string LicenseNumber { get; set; }
		public string Name { get; set; }
		public int? Year { get; set; }
		public int NumOfSeat { get; set; }
		public int NumOfComment { get; set; }
		public decimal? Star { get; set; }

		protected VehicleRecordJsonModel(Vehicle vehicle)
		{
			ID = vehicle.ID;
			LicenseNumber = vehicle.LicenseNumber;
			Name = vehicle.Name;
			Year = vehicle.Year;
			NumOfSeat = vehicle.VehicleModel.NumOfSeat;
			NumOfComment = vehicle.NumOfComment;
			Star = vehicle.Star;
		}
	}

	public class VehicleManagementItemJsonModel : VehicleRecordJsonModel
	{
		public string VehicleGroupName { get; set; }

		public VehicleManagementItemJsonModel(Vehicle vehicle) : base(vehicle)
		{
			if(vehicle.VehicleGroup != null)
			{
				VehicleGroupName = vehicle.VehicleGroup.Name;
			} else
			{
				VehicleGroupName = null;
			}
			
		}
	}

	public class VehicleDetailInfoViewModel
	{
		public int ID { get; set; }
		public string LicenseNumber { get; set; }
		public string Name { get; set; }
		public int ModelID { get; set; }
		public string ModelName { get; set; }
		public int? Year { get; set; }
		public int GarageID { get; set; }
		public string GarageName { get; set; }
		public int? VehicleGroupID { get; set; }
		public string VehicleGroupName { get; set; }
		public int TransmissionTypeID { get; set; }
		public string TransmissionTypeName { get; set; }
		public string TransmissionDetail { get; set; }
		public int? FuelTypeID { get; set; }
		public string FuelTypeName { get; set; }
		public string Engine { get; set; }
		public int ColorID { get; set; }
		public string ColorName { get; set; }
		public string Description { get; set; }
		public decimal Star { get; set; }
		public int NumOfComment { get; set; }
		public List<ImageView> ImageList { get; set; }

		public IEnumerable<SelectListItem> listGarage { get; set; }
		public IEnumerable<SelectListItem> listGroup { get; set; }
		public List<VehicleBrand> brandList { get; set; }
		
		public VehicleDetailInfoViewModel(Vehicle vehicle)
		{
			ID = vehicle.ID;
			LicenseNumber = vehicle.LicenseNumber;
			Name = vehicle.Name;
			ModelID = vehicle.ModelID;
			ModelName = vehicle.ModelID == 0
				? "Dòng xe chưa được liệt kê."
				: vehicle.VehicleModel.VehicleBrand.Name + " " + vehicle.VehicleModel.Name;
			Year = vehicle.Year;
			GarageID = vehicle.GarageID;
			GarageName = vehicle.Garage.Name;

			if(vehicle.VehicleGroupID != null)
			{
				VehicleGroupID = vehicle.VehicleGroupID;
				VehicleGroupName = vehicle.VehicleGroup.Name;
			}

			Engine = vehicle.Engine;
			TransmissionTypeID = vehicle.TransmissionType;
			TransmissionTypeName = Constants.TRANSMISSION_TYPE[vehicle.TransmissionType];
			TransmissionDetail = vehicle.TransmissionDetail;

			if (vehicle.FuelType != null)
			{
				FuelTypeID = vehicle.FuelType;
				FuelTypeName = Constants.FUEL_TYPE[FuelTypeID.Value];
			}

			ColorID = vehicle.Color;
			ColorName = Constants.COLOR[ColorID];

			Description = vehicle.Description;

			Star = vehicle.Star;
			NumOfComment = vehicle.NumOfComment;

			this.ImageList = vehicle.VehicleImages.Select(i => new ImageView() {Id = i.ID, Url = i.URL}).ToList();
		}

		public class ImageView
		{
			public string Id { get; set; }
			public string Url { get; set; }
		}
	}

	public class VehicleCalendarModel
	{
		public int ID { get; set; }
		public DateTime StartTime { get; set; }
		public DateTime EndTime { get; set; }
	}

	public class FilterByGarageView
	{
		public int garageID { get; set; }
		public IEnumerable<SelectListItem> listGarage { get; set; }
		public IEnumerable<SelectListItem> GroupList { get; set; }
		public List<VehicleBrand> BrandList { get; set; }
	}
}