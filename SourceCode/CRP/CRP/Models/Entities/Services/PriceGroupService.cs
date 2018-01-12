using CRP.Models.Entities.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Services
{
    public interface IPriceGroupService : IService<PriceGroup>
    {

    }
    public class PriceGroupService : BaseService<PriceGroup>, IPriceGroupService
    {
        public PriceGroupService(IUnitOfWork unitOfWork, IPriceGroupRepository repository) : base(unitOfWork, repository)
        {

        }
    }
}