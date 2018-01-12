using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Repositories
{
    public interface IPriceGroupItemRepository : IRepository<PriceGroupItem>
    {

    }
    public class PriceGroupItemRepository : BaseRepository<PriceGroupItem>, IPriceGroupItemRepository
    {
        public PriceGroupItemRepository(CRPEntities dbContext) : base(dbContext)
        {
        }
    }
}