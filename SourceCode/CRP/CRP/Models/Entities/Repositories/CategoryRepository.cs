using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Repositories
{
	public interface ICategoryRepository : IRepository<Category>
	{

	}

	public class CategoryRepository : BaseRepository<Category>, ICategoryRepository
	{
		public CategoryRepository(CRPEntities dbContext) : base(dbContext)
		{
		}
	}
}