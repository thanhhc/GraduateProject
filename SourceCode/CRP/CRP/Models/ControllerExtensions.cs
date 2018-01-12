using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CRP.Models
{
    public static class ControllerExtensions
    {
        public static T Service<T>(this Controller controller)
        {
            return DependencyResolver.Current.GetService<T>();
        }
    }
}