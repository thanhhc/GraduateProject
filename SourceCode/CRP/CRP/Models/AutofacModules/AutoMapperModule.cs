using Autofac;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.AutofacModules
{
    public class AutoMapperModule :Module
    {
        private MapperConfiguration mapperConfig;

        public AutoMapperModule(MapperConfiguration mapperConfig)
        {
            this.mapperConfig = mapperConfig;
        }

        protected override void Load(ContainerBuilder builder)
        {
            base.Load(builder);

            var mapper = mapperConfig.CreateMapper();

            builder.RegisterInstance(this.mapperConfig)
                .As<IConfigurationProvider>()
                .SingleInstance();

            builder.RegisterInstance(mapper)
                .As<IMapper>()
                .SingleInstance();
        }
    }
}