using CRP.Models.Entities.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Services
{
    public interface IPriceGroupItemService : IService<PriceGroupItem>
    {

    }
    public class PriceGroupItemService : BaseService<PriceGroupItem>, IPriceGroupItemService
    {
        public PriceGroupItemService(IUnitOfWork unitOfWork, IPriceGroupItemRepository repository) : base(unitOfWork, repository)
        {

        }
    }
}