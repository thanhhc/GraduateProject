using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Repositories
{
    public interface IPriceGroupRepository : IRepository<PriceGroup>
    {

    }
    public class PriceGroupRepository : BaseRepository<PriceGroup>, IPriceGroupRepository
    {
        public PriceGroupRepository(CRPEntities dbContext) : base(dbContext)
        {
        }
    }
}