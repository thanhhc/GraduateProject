using CRP.Controllers;
using CRP.Models;
using CRP.Models.Entities.Services;
using CRP.Models.ViewModels;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CRP.Areas.Provider.Controllers
{
	[Authorize(Roles = "Provider")]
	public class BookingManagementController : BaseController
    {
        // Route to vehicleManagement page
        [Route("management/BookingManagement")]
        public ViewResult BookingManagement()
        {
            var service = this.Service<IGarageService>();
            FilterByGarageView garageView = new FilterByGarageView();
            var providerID = User.Identity.GetUserId();
            garageView.listGarage = service.Get(q => q.OwnerID == providerID)
                .Select(q => new SelectListItem()
                {
                    Text = q.Name,
                    Value = q.ID.ToString(),
                    Selected = true,
                });
            return View("~/Areas/Provider/Views/BookingManagement/BookingManagement.cshtml", garageView);
        }


		[Route("api/management/bookings", Name = "GetBookingListAPI")]
		[HttpGet]
		public ActionResult GetListBooking(BookingsFilterConditions conditions)
		{
			if (conditions.Draw == 0)
			{
				return new HttpStatusCodeResult(400, "Unqualified request");
			}
			if (conditions.OrderBy != null
				&& typeof(BookingsRecordJsonModel).GetProperty(conditions.OrderBy) == null)
			{
				return new HttpStatusCodeResult(400, "Invalid sorting property");
			}

			conditions.providerID = User.Identity.GetUserId();

			var service = this.Service<IBookingReceiptService>();
			var bookings = service.FilterBookings(conditions);
			return Json(bookings, JsonRequestBehavior.AllowGet);
		}
	}
}