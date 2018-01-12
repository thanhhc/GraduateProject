using AutoMapper;
using CRP.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CRP.Controllers
{
    public class BaseController : Controller
    {
        public IConfigurationProvider MapperConfig
        {
            get
            {
                return this.Service<IConfigurationProvider>();
            }
        }

        public IMapper Mapper
        {
            get
            {
                return this.Service<IMapper>();
            }
        }
    }
}