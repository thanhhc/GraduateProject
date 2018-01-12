using AutoMapper;
using CRP.Models.Entities;
using CRP.Models.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP
{
    public static class AutoMapperConfiguration
    {
        public static void Configure()
        {
            Mapper.Initialize(config => {
                config.CreateMissingTypeMaps = true;
                config.CreateMap<VehicleGroup, VehicleGroupViewModel>();
            });
        }
    }
}