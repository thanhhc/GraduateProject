using System;
using System.Linq;
using CRP.Models.Entities.Repositories;
using CRP.Models.ViewModels;
using System.Collections.Generic;
using System.Data.Entity.Core.Common.CommandTrees;

namespace CRP.Models.Entities.Services
{
	public interface IVehicleService : IService<Vehicle>
	{
		VehicleDataTablesJsonModel FilterVehicle(VehicleManagementFilterConditionModel filterConditions);
	}

	public class VehicleService : BaseService<Vehicle>, IVehicleService
	{
		public VehicleService(IUnitOfWork unitOfWork, IVehicleRepository repository) : base(unitOfWork, repository)
		{

		}

		public VehicleDataTablesJsonModel FilterVehicle(VehicleManagementFilterConditionModel filterConditions)
		{
			// Get only vehicles belonged to this user and is not deleted
			var vehicles = repository.Get(v => v.Garage.OwnerID == filterConditions.ProviderID
											&& !v.IsDeleted);

			// Get vehicles belonged to this garage
			if(filterConditions.GarageID != null)
				vehicles = vehicles.Where(v => v.GarageID == filterConditions.GarageID);

			// Get vehicles belonged to this vehicle group
			if (filterConditions.VehicleGroupID != null)
				vehicles = vehicles.Where(v => v.VehicleGroupID == filterConditions.VehicleGroupID);

			var recordsTotal = vehicles.Count();

			// Search, if Search param exists
			if (filterConditions.Search != null)
				vehicles = vehicles.Where(v => v.Name.Contains(filterConditions.Search)
				                               || v.LicenseNumber.Contains(filterConditions.Search));

			// Parse into returnable model
			var results = vehicles.ToList().Select(v => new VehicleManagementItemJsonModel(v));

			// Sort
			// Validate OrderBy in controller
			if (filterConditions.OrderBy == null || nameof(VehicleManagementItemJsonModel.ID ) == filterConditions.OrderBy)
			{
				results = results.OrderBy(r => r.Name);
			}
			else
			{
				// Always sort by name after selected sorting prop
				if (nameof(VehicleManagementItemJsonModel.Name) == filterConditions.OrderBy)
				{
					results = filterConditions.IsDescendingOrder
						? results.OrderByDescending(r => r.Name)
						: results.OrderBy(r => r.Name);
				}
				else
				{
					var sortingProp = typeof(VehicleManagementItemJsonModel).GetProperty(filterConditions.OrderBy);
					results = filterConditions.IsDescendingOrder
						? results.OrderByDescending(r => sortingProp.GetValue(r))
						: results.OrderBy(r => sortingProp.GetValue(r));
				}
			}

			// Paginate
			var filteredRecords = results.Count();
			if ((filterConditions.Page - 1) * filterConditions.RecordPerPage > filteredRecords)
				filterConditions.Page = 1;

			results = results.Skip((filterConditions.Page - 1) * filterConditions.RecordPerPage)
					.Take(filterConditions.RecordPerPage);

			return new VehicleDataTablesJsonModel(results.ToList(), filterConditions.Draw, recordsTotal, filteredRecords);
		}
	}
}