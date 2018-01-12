using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Repositories
{
	public interface ILocationRepository : IRepository<Location>
	{

	}

	public class LocationRepository : BaseRepository<Location>, ILocationRepository
	{
		public LocationRepository(CRPEntities dbContext) : base(dbContext)
		{
		}
	}
}