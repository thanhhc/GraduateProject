using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Repositories
{
    public interface IGarageWorkingTimeRepository : IRepository<GarageWorkingTime>
    {
    }

    public class GarageWorkingTimeRepository : BaseRepository<GarageWorkingTime>, IGarageWorkingTimeRepository
    {
        public GarageWorkingTimeRepository(CRPEntities dbContext) : base(dbContext) { }
    }
}