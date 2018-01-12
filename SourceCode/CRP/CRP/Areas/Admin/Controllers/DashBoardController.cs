using CRP.Controllers;
using CRP.Models.ViewModels;
using CRP.Models.Entities;
using CRP.Models.Entities.Repositories;
using CRP.Models.Entities.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CRP.Models;

namespace CRP.Areas.Admin.Controllers
{
	[Authorize(Roles = "Admin")]
	public class DashBoardController : BaseController
	{
		// Route to admin dashboard
		[Route("dashboard/admin", Name = "AdminDashboard")]
		public ActionResult AdminDashboard()
		{
			var viewModel = new AdminReportViewModel();
			var bookingService = this.Service<IBookingReceiptService>();
			var vehicleService = this.Service<IVehicleService>();
			var userService = this.Service<IUserService>();
			var garageService = this.Service<IGarageService>();

			var utcNow = DateTime.UtcNow;
			var activeUsers = userService.Get(u => !u.LockoutEnabled || u.LockoutEndDateUtc < utcNow);
			viewModel.NumOfActiveUser = activeUsers.Count(u => u.AspNetRoles.Any(r => r.Name != "Admin"));

			var activeProviders = activeUsers.Where(u => u.AspNetRoles.Any(r => r.Name == "Provider"));
			viewModel.NumOfActiveProvider = activeProviders.Count();

			viewModel.NumOfActiveGarage = garageService.Get(g => g.IsActive && activeProviders.Contains(g.AspNetUser)).Count();

			viewModel.NumOfActiveVehicle =
				vehicleService.Get()
					.Count(v => v.VehicleGroupID != null
						&& v.VehicleGroup.IsActive
						&& activeProviders.Contains(v.Garage.AspNetUser));

			// Current month's report
			var now = DateTime.Now;
			var thisMonth = new DateTime(now.Year, now.Month, 1);

			var receipts = bookingService.Get(r => !r.IsPending && r.CustomerID != r.Garage.OwnerID
										&& r.BookingTime < now
										&& r.BookingTime.Month == thisMonth.Month
										&& r.BookingTime.Year == thisMonth.Year);

			viewModel.ThisMonthNumOfSuccessfulBooking = receipts.Count();
			if(receipts.Any())
			{
				viewModel.ThisMonthNumOfProfit = receipts.Sum(r => r.BookingFee);
			}

			// Calculate monthly reports for last half year
			for (var i = 1; i < 7; i++)
			{
				var reportTime = thisMonth.AddMonths(-i);
				receipts = bookingService.Get(r => !r.IsPending && r.CustomerID != r.Garage.OwnerID
										&& r.BookingTime < now
										&& r.BookingTime.Month == reportTime.Month
										&& r.BookingTime.Year == reportTime.Year);

				viewModel.AddMonthlyReport(receipts.ToList(), reportTime);
			}

			return View("~/Areas/Admin/Views/Dashboard/Index.cshtml", viewModel);
		}

		//[System.Web.Mvc.Route("api/reportProvider")]
		//[System.Web.Mvc.HttpGet]
		//public JsonResult getProviderListAPI()
		//{
		//    var serviceUser = this.Service<IUserReceiptService>();
		//    var serviceBooking = this.Service<IBookingReceiptService>();
		//    var serviceCar = this.Service<IVehicleService>();
		//    List<BookingReceipt> lstBooking = new List<BookingReceipt>();
		//    var lstProvider = serviceUser.Get(q => q.AspNetRoles.Any(r => r.Name == "Provider")).ToList();
		//    List<ReportProviderViewModel> listPro = new List<ReportProviderViewModel>();
		//    DateTime today = DateTime.Now;
		//    DateTime lastMonth = today.AddMonths(-1);
		//    foreach(AspNetUser item in lstProvider)
		//    {
		//        ReportProviderViewModel item2 = new ReportProviderViewModel();
		//        item2.ID = item.Id;
		//        item2.ProviderName = item.UserName;
		//        lstBooking = serviceBooking.Get(q => q.AspNetUser1.Id == item.Id && q.IsSelfBooking == false && q.IsCanceled == false &&
		//        q.IsPending == false).ToList();
		//        foreach(BookingReceipt boo in lstBooking)
		//        {
		//            item2.money = (item2.money + boo.RentalPrice);
		//        }
		//        lstBooking = serviceBooking.Get(q => q.AspNetUser1.Id == item.Id && q.IsSelfBooking == false && q.IsCanceled == false &&
		//        q.IsPending == false && q.EndTime < lastMonth).ToList();
		//        foreach (BookingReceipt boo in lstBooking)
		//        {
		//            item2.compare = (item2.compare + boo.RentalPrice);
		//        }
		//        item2.car = serviceCar.Get(q => q.Garage.OwnerID.Contains(item.Id)).ToList().Count();
		//        item2.status = !item.LockoutEnabled;
		//        listPro.Add(item2);
		//    }
		//    return Json(new { aaData = listPro }, JsonRequestBehavior.AllowGet);
		//}

		//[System.Web.Mvc.Route("api/reportGarage")]
		//[System.Web.Mvc.HttpGet]
		//public JsonResult getGarageListAPI()
		//{
		//    var serviceGarage = this.Service<IGarageService>();
		//    var serviceBooking = this.Service<IBookingReceiptService>();
		//    var serviceCar = this.Service<IVehicleService>();
		//    List<BookingReceipt> lstBooking = new List<BookingReceipt>();
		//    List<ReportGarageViewModel> listGarage = new List<ReportGarageViewModel>();
		//    var listGara = serviceGarage.Get().ToList();
		//    DateTime today = DateTime.Now;
		//    DateTime lastMonth = today.AddMonths(-1);
		//    foreach (Garage item in listGara)
		//    {
		//        ReportGarageViewModel item2 = new ReportGarageViewModel();
		//        item2.ID = item.ID;
		//        item2.GarageName = item.Name;
		//        lstBooking = serviceBooking.Get(q => q.GarageID == item.ID && q.IsSelfBooking == false && q.IsCanceled == false &&
		//       q.IsPending == false).ToList();
		//        foreach (BookingReceipt boo in lstBooking)
		//        {
		//            item2.money = (item2.money + boo.RentalPrice);
		//        }

		//        lstBooking = serviceBooking.Get(q => q.GarageID == item.ID && q.IsSelfBooking == false && q.IsCanceled == false &&
		//        q.IsPending == false && q.EndTime < lastMonth).ToList();
		//        foreach (BookingReceipt boo in lstBooking)
		//        {
		//            item2.compare = (item2.compare + boo.RentalPrice);
		//        }
		//        item2.car = serviceCar.Get(q => q.GarageID == item.ID).ToList().Count();
		//        item2.owner = item.AspNetUser.UserName;
		//        item2.status = item.IsActive;
		//        listGarage.Add(item2);
		//    }
		//    return Json(new { aaData = listGarage }, JsonRequestBehavior.AllowGet);
		//}
	}
}