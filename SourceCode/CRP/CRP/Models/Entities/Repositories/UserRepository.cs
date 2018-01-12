using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Repositories
{
    public interface IUserRepository : IRepository<AspNetUser>
    {
    }
    public class UserRepository : BaseRepository<AspNetUser>, IUserRepository
    {
        public UserRepository(CRPEntities dbContext) : base(dbContext)
        {
        }
    }
}