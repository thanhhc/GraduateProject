using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.ViewModels
{
    public class PriceGroupItemViewModel
    {
        public int ID { get; set; }
        public int PriceGroupID { get; set; }
        public int MaxTime { get; set; }
        public double Price { get; set; }
    }
}