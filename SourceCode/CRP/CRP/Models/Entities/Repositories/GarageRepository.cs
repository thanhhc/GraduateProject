using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Repositories
{
    public interface IGarageRepository : IRepository<Garage>
    {

    }

    public class GarageRepository : BaseRepository<Garage>, IGarageRepository
    {
        public GarageRepository(CRPEntities dbContext) : base(dbContext)
        {
        }
    }
}