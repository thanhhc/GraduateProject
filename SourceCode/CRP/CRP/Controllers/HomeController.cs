using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using CRP.Helpers;
using CRP.Models;
using CRP.Models.Entities;
using CRP.Models.Entities.Services;
using CRP.Models.ViewModels;
using Microsoft.AspNet.Identity;
using Constants = CRP.Models.Constants;

namespace CRP.Controllers
{
	public class HomeController : BaseController
	{
		// Route to homepage
		public ActionResult Index()
		{
			var locationService = this.Service<ILocationService>();
			// Only get location w/ garage
			return View(locationService.Get(l => l.Garages.Count > 0).OrderBy(l => l.Name).ToList());
		}

		// Route to vehicle search results
		[Route("search", Name = "SearchPage")]
		public ActionResult Search()
		{
			var viewModel = new SearchPageViewModel();

			viewModel.BrandList = this.Service<IBrandService>().Get(
				b => b.ID != 1 // Exclude unlisted brand
			).OrderBy(b => b.Name).ToList();

			// Reorder each brand's models by name
			// Only get brand w/ model w/ registered vehicles
			viewModel.BrandList = viewModel.BrandList.Aggregate(new List<VehicleBrand>(), (newBrandList, b) =>
			{
				b.VehicleModels = b.VehicleModels.Aggregate(new List<VehicleModel>(), (newModelList, m) =>
				{
					if (m.Vehicles.Any())
						newModelList.Add(m);
					return newModelList;
				});

				if (b.VehicleModels.Any())
				{
					b.VehicleModels = b.VehicleModels.OrderBy(m => m.Name).ToList();
					newBrandList.Add(b);
				}

				return newBrandList;
			});
			
			viewModel.NumOfSeatList = this.Service<IModelService>()
					.Get().Select(m => m.NumOfSeat).Distinct().Where(s => s != 0).ToList();

			viewModel.CategoryList = this.Service<ICategoryService>().Get().OrderBy(c => c.Name).ToList();
			
			// Only get location w/ garage
			viewModel.LocationList = this.Service<ILocationService>()
						.Get(l => l.Garages.Any(g => g.IsActive
												&& !g.IsDeleted
												&& g.AspNetUser.AspNetRoles.Any(r => r.Name == "Provider")
												&& (g.AspNetUser.LockoutEndDateUtc == null || g.AspNetUser.LockoutEndDateUtc < DateTime.UtcNow))
						).OrderBy(l => l.Name).ToList();

			var priceGroupService = this.Service<IPriceGroupService>();
			var maxPerDayPriceGroup = priceGroupService.Get().OrderByDescending(pg => pg.PerDayPrice).FirstOrDefault();
			var minPerDayPriceGroup = priceGroupService.Get().OrderBy(pg => pg.PerDayPrice).FirstOrDefault();

			var priceGroupItemService = this.Service<IPriceGroupItemService>();
			var maxPriceGroupItem = priceGroupItemService.Get().OrderByDescending(pgi => pgi.Price).FirstOrDefault();
			var minPriceGroupItem = priceGroupItemService.Get().OrderBy(pgi => pgi.Price).FirstOrDefault();

			if (maxPerDayPriceGroup != null &&
				(maxPriceGroupItem == null || maxPerDayPriceGroup.PerDayPrice > maxPriceGroupItem.Price))
			{
				viewModel.MaxPrice = maxPerDayPriceGroup.PerDayPrice;
				viewModel.MaxPriceUnit = "ngày";
			}
			else if (maxPriceGroupItem != null)
			{
				viewModel.MaxPrice = maxPriceGroupItem.Price;
				viewModel.MaxPriceUnit = maxPriceGroupItem.MaxTime + " giờ";
			}

			if (minPerDayPriceGroup != null &&
				(minPriceGroupItem == null || minPerDayPriceGroup.PerDayPrice < minPriceGroupItem.Price))
			{
				viewModel.MinPrice = minPerDayPriceGroup.PerDayPrice;
				viewModel.MinPriceUnit = "ngày";
			}
			else if (minPriceGroupItem != null)
			{
				viewModel.MinPrice = minPriceGroupItem.Price;
				viewModel.MinPriceUnit = minPriceGroupItem.MaxTime + " giờ";
			}
			
			var vehicles = this.Service<IVehicleService>().Get();
			viewModel.MaxYear = vehicles.Max(v => v.Year);
			viewModel.MinYear = vehicles.Min(v => v.Year);

			return View(viewModel);
		}

		// Route to vehicle's info
		[Route("vehicleInfo/{id:int}", Name = "VehicleInfo")]
		public ActionResult VehicleInfo(int id)
		{
			var vehicle = this.Service<IVehicleService>().Get(v => v.ID == id
										&& !v.IsDeleted
										&& v.Garage.IsActive
										&& v.Garage.AspNetUser.AspNetRoles.Any(r => r.Name == "Provider")
										&& (v.Garage.AspNetUser.LockoutEndDateUtc == null || v.Garage.AspNetUser.LockoutEndDateUtc < DateTime.UtcNow)
										&& v.VehicleGroup != null
										&& v.VehicleGroup.IsActive)
								.FirstOrDefault();

			if(vehicle == null)
				return new HttpNotFoundResult();

			return View(vehicle);
		}

		// API Route for guest/customer to search vehicle for booking
		// Need filtering/sorting support
		[HttpGet]
		[Route("api/search", Name = "SearchVehiclesAPI")]
		public ActionResult SearchVehiclesAPI(SearchConditionModel searchConditions)
		{
			if (searchConditions?.StartTime == null
					|| searchConditions.EndTime == null
					|| searchConditions.StartTime.Value < DateTime.Now.AddHours(Constants.SOONEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_HOUR)
					|| searchConditions.StartTime.Value > DateTime.Now.AddDays(Constants.LATEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_DAY)
					|| searchConditions.EndTime.Value < DateTime.Now.AddHours(Constants.SOONEST_POSSIBLE_BOOKING_END_TIME_FROM_NOW_IN_HOUR))
				return new HttpStatusCodeResult(400, "Invalid booking time");

			if (searchConditions.MaxPrice != null && searchConditions.MinPrice != null
					&& searchConditions.MaxPrice < searchConditions.MinPrice)
				return new HttpStatusCodeResult(400, "Invalid price span");

			if (searchConditions.MaxProductionYear != null && searchConditions.MinProductionYear != null
					&& searchConditions.MaxProductionYear < searchConditions.MinProductionYear)
				return new HttpStatusCodeResult(400, "Invalid production year range");

			if (!(searchConditions.OrderBy == null
					|| Constants.ALLOWED_SORTING_PROPS_IN_SEARCH_PAGE.Any(r => r.Name == searchConditions.OrderBy)))
				return new HttpStatusCodeResult(400, "Invalid sorting property");

			Response.StatusCode = 200;
			Response.StatusDescription = "Queried successfully";

			var userId = User.Identity.GetUserId();
			var user = this.Service<IUserService>().Get(userId);
			var searcher = new Searcher();
			var searchResult = searcher.SearchVehicle(searchConditions, user);

			return Json(searchResult, JsonRequestBehavior.AllowGet);
		}
		
		// API route for getting booking calendar of a vehicle
		// Only get bookingReceipt of the next 30 days from this moment
		[Route("api/bookings/calendar/{vehicleID:int}", Name = "GetBookingCalendarAPI")]
		[HttpGet]
		public async Task<ActionResult> GetBookingCalendarAPI(int? vehicleID)
		{
			if(vehicleID == null)
				return new HttpStatusCodeResult(400, "Bad request");

			var vehicleService = this.Service<IVehicleService>();
			var vehicle = await vehicleService.GetAsync(vehicleID.Value);

			if(vehicle == null)
				return new HttpStatusCodeResult(404, "Vehicle not found");

			var bookings = vehicle.BookingReceipts
					.Where(br => !br.IsCanceled && br.EndTime >= DateTime.Now)
					.Select(br => new
						{
							start = br.StartTime.AddHours(-Constants.IN_BETWEEN_BOOKING_REST_TIME_IN_HOUR)
												.ToUniversalTime().ToString("o")
							, end = br.EndTime.AddHours(Constants.IN_BETWEEN_BOOKING_REST_TIME_IN_HOUR)
												.ToUniversalTime().ToString("o")
						});

			return Json(bookings, JsonRequestBehavior.AllowGet);
		}

		// API route for getting comments of a vehicle
		// Order by endTime - desc
		// Pagination needed
		[Route("api/bookings/comments/{vehicleID:int}", Name = "GetCommentAPI")]
		[HttpGet]
		public async Task<ActionResult> GetCommentAPI(int? vehicleID, int page = 1)
		{
			if (vehicleID == null)
				return new HttpStatusCodeResult(400, "Bad request");

			var vehicleService = this.Service<IVehicleService>();
			var vehicle = await vehicleService.GetAsync(vehicleID.Value);

			if (vehicle == null)
				return new HttpStatusCodeResult(404, "Vehicle not found");
			
			var comments = vehicle.BookingReceipts
					// Get only the ones with comment
					.Where(br => br.Comment != null)
					// Sort
					.OrderByDescending(br => br.EndTime)
					// Paginate
					.Skip((page - 1) * Constants.NUM_OF_COMMENT_PER_PAGE)
					.Take(Constants.NUM_OF_COMMENT_PER_PAGE)
					// Parse into json model
					.Select(br => new
					{
						customer = br.AspNetUser.UserName
						, avatarURL = br.AspNetUser.AvatarURL
						, comment = br.Comment
						, star = br.Star
					});

			return Json(comments, JsonRequestBehavior.AllowGet);
		}
	}
}