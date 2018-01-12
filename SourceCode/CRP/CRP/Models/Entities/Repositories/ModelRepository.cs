using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Repositories
{
    public interface IModelRepository : IRepository<VehicleModel>
    {

    }

    public class ModelRepository : BaseRepository<VehicleModel>, IModelRepository
    {
        public ModelRepository(CRPEntities dbContext) : base(dbContext)
        {
        }
    }
}