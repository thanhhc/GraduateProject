using CRP.Models.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CRP.Models.ViewModels
{
    public class GarageModel : Garage
    {
        public IEnumerable<SelectListItem> listLocation { get; set; }
    }
}