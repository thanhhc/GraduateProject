using CRP.Models.Entities.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Services
{
    public interface IRoleService : IService<AspNetRole>
    {
    }
    public class RoleService : BaseService<AspNetRole>, IRoleService
    {
        public RoleService(IUnitOfWork unitOfWork, IRoleRepository repository) : base(unitOfWork, repository)
        {

        }
    }
}