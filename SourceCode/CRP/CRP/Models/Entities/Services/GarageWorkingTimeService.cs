using CRP.Models.Entities.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Services
{
    public interface IGarageWorkingTimeService : IService<GarageWorkingTime>
    {
    }

    public class GarageWorkingTimeService : BaseService<GarageWorkingTime>, IGarageWorkingTimeService
    {
        public GarageWorkingTimeService() { }
        public GarageWorkingTimeService(IUnitOfWork unitOfWork, IGarageWorkingTimeRepository repository) : base(unitOfWork, repository) { }
    }
}