using AutoMapper;
using CRP.Models.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CRP.Models.ViewModels
{
	public class VehicleGroupViewModel : VehicleGroup
	{
        public int vehicleID { get; set; }
        public int otherGroupID { get; set; }
        public IEnumerable<SelectListItem> listVehicle { get; set; }
        public IEnumerable<SelectListItem> listGroup { get; set; }

        public VehicleGroupViewModel() : base() { }

		public VehicleGroupViewModel(VehicleGroup vg, IMapper mapper) : this()
		{
			mapper.Map(vg, this);
		}
		 public VehicleGroupViewModel(VehicleGroup vg)
		{
			this.ID = vg.ID;
			this.Name = vg.Name;
			this.IsActive = vg.IsActive;
			this.WithDriverPriceGroupID = vg.WithDriverPriceGroupID;
			this.PriceGroup = vg.PriceGroup;
			this.Vehicles = vg.Vehicles;
		}

	}

	public class VehicleGroupModel
	{
		public int ID { get; set; }
		public string Name { get; set; }
		public bool IsActive { get; set; }
		public int? MaxRentalPeriod { get; set; }
		public int DefaultPriceGroupID { get; set; }
	}
}