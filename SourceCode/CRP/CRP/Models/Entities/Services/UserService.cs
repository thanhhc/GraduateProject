using CRP.Models.Entities.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using System.Web;

namespace CRP.Models.Entities.Services
{
	public interface IUserService : IService<AspNetUser>
	{

	}
	public class UserService : BaseService<AspNetUser>, IUserService
	{
		public UserService()
		{
		}

		public UserService(IUnitOfWork unitOfWork, IUserRepository repository) : base(unitOfWork, repository)
		{

		}
	}
}