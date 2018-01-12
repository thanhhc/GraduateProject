using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CRP.Models.JsonModels;
using CRP.Models.ViewModels;

namespace CRP.Models.Entities.Repositories
{
	public interface IVehicleRepository : IRepository<Vehicle>
    {

    }
    public class VehicleRepository : BaseRepository<Vehicle>, IVehicleRepository
    {
        public VehicleRepository(CRPEntities dbContext) : base(dbContext)
        {
        }
    }
}