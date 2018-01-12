using CRP.Models.Entities.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Services
{
	public interface IBrandService : IService<VehicleBrand>
	{
	}

	public class BrandService : BaseService<VehicleBrand>, IBrandService
	{
		public BrandService(IUnitOfWork unitOfWork, IBrandRepository repository) : base(unitOfWork, repository)
        {

        }
	}
}