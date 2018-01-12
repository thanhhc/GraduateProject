using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Repositories
{
	public interface IBrandRepository : IRepository<VehicleBrand>
	{

	}

	public class BrandRepository : BaseRepository<VehicleBrand>, IBrandRepository
	{
		public BrandRepository(CRPEntities dbContext) : base(dbContext)
		{
		}
	}
}