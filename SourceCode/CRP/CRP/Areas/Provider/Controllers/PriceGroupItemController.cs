using CRP.Controllers;
using CRP.Models;
using CRP.Models.Entities.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CRP.Areas.Provider.Controllers
{
    [Authorize(Roles = "Provider")]
    public class PriceGroupItemController : BaseController
    {
        // GET: Provider/PriceGroup
        [Route("api/priceGroup/{id:int}")]
        public JsonResult priceGroupList(int id)
        {
            var service = this.Service<IPriceGroupItemService>();
            var list = service.Get().ToList();
            var result = list
                .Where(q => q.PriceGroupID == id )
                .Select(q => new IConvertible[] {
                q.MaxTime,
                q.Price,
                q.MaxDistance
            });
            return Json(new { aaData = result }, JsonRequestBehavior.AllowGet);
        }
    }
}