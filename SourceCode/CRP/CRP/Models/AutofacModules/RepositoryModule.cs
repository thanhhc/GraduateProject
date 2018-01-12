using Autofac;
using CRP.Models.Entities.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace CRP.Models.AutofacModules
{
    public class RepositoryModule : Autofac.Module
    {
        private Assembly assembly;

        public RepositoryModule(Assembly assembly)
        {
            this.assembly = assembly;
        }

        protected override void Load(ContainerBuilder builder)
        {
            var repoType = typeof(IRepository);
            builder.RegisterAssemblyTypes(this.assembly)
                .Where(q => repoType.IsAssignableFrom(q))
                .AsImplementedInterfaces()
                .InstancePerRequest();
        }
    }
}