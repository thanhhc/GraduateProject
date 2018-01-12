using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Repositories
{
    
        public interface IVehicleImageRepository : IRepository<VehicleImage>
        {

        }
        public class VehicleImageRepository : BaseRepository<VehicleImage>, IVehicleImageRepository
        {
            public VehicleImageRepository(CRPEntities dbContext) : base(dbContext)
            {
            }
        }
    }
