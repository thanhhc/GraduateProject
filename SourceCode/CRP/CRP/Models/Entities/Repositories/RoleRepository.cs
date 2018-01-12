using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Repositories
{
    public interface IRoleRepository : IRepository<AspNetRole>
    {

    }

    public class RoleRepository : BaseRepository<AspNetRole>, IRoleRepository
    {
        public RoleRepository(CRPEntities dbContext) : base(dbContext)
        {
        }
    }
}