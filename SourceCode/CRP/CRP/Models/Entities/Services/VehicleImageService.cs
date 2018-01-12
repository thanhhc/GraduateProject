using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CRP.Models.Entities.Repositories;

namespace CRP.Models.Entities.Services
{

    public interface IVehicleImageService : IService<VehicleImage>
    {
    }
    public class VehicleImageService : BaseService<VehicleImage>, IVehicleImageService
        {
            public VehicleImageService(IUnitOfWork unitOfWork, IVehicleImageRepository repository) : base(unitOfWork, repository)
            {

            }

    }
    }
