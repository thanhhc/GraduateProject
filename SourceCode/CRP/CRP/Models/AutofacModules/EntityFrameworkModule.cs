using Autofac;
using CRP.Models.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace CRP.Models.AutofacModules
{
    public class EntityFrameworkModule : Autofac.Module
    {
        private Assembly assembly;

        public EntityFrameworkModule(Assembly assembly)
        {
            this.assembly = assembly;
        }

        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<UnitOfWork>()
                .AsImplementedInterfaces()
                .InstancePerRequest();

            builder.RegisterType<CRPEntities>()
                .InstancePerRequest();
        }
    }
}