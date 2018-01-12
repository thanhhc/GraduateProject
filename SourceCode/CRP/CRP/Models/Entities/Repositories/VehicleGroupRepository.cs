using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Repositories
{
    public interface IVehicleGroupRepository : IRepository<VehicleGroup>
    {

    }

    public class VehicleGroupRepository : BaseRepository<VehicleGroup>, IVehicleGroupRepository
    {
        public VehicleGroupRepository(CRPEntities dbContext) : base(dbContext)
        {
        }
    }
}