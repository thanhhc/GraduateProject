using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CRP.Models.Entities.Repositories;

namespace CRP.Models.Entities.Services
{
	public interface ICategoryService : IService<Category>
	{
	}

	public class CategoryService : BaseService<Category>, ICategoryService
	{
		public CategoryService(IUnitOfWork unitOfWork, ICategoryRepository repository) : base(unitOfWork, repository)
		{
		}
	}
}