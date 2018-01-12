using Autofac;
using CRP.Models.Entities.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace CRP.Models.AutofacModules
{
    public class ServiceModule : Autofac.Module
    {
        private Assembly assembly;

        public ServiceModule(Assembly assembly)
        {
            this.assembly = assembly;
        }

        protected override void Load(ContainerBuilder builder)
        {
            var repoType = typeof(IService);
            builder.RegisterAssemblyTypes(this.assembly)
                .Where(q => repoType.IsAssignableFrom(q))
                .AsImplementedInterfaces()
                .InstancePerRequest();
        }
    }
}