using CRP.Models.Entities.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Services
{
	public interface IGarageService : IService<Garage>
    {
    }
    public class GarageService :BaseService<Garage>, IGarageService
    {
        public GarageService()
        {
        }

        public GarageService(IUnitOfWork unitOfWork, IGarageRepository repository) :base(unitOfWork, repository)
        {
        }
    }
}