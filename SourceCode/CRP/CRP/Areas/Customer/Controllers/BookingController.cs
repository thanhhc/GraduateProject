using CRP.Controllers;
using CRP.Models;
using CRP.Models.Entities;
using CRP.Models.Entities.Services;
using CRP.Models.ViewModels;
using Microsoft.AspNet.Identity;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;
using System.Web;
using System.Web.Mvc;
using API_NganLuong;
using CRP.Models.Entities.Repositories;
using Microsoft.AspNet.Identity.Owin;
using Constants = CRP.Models.Constants;
using UrlHelper = Microsoft.AspNetCore.Mvc.Routing.UrlHelper;

namespace CRP.Areas.Customer.Controllers
{
	[Authorize(Roles = "Customer")]
	public class BookingController : BaseController
	{
		// API route to create a booking if possible
		[System.Web.Mvc.Route("api/bookings", Name = "TryBookingAPI")]
		[System.Web.Mvc.HttpPost]
		public System.Web.Mvc.ActionResult TryBookingAPI(BookingCreatingModel model)
		{
			// Check if vehicleID exists
			if (model.VehicleID == null)
				return new HttpStatusCodeResult(400, "Invalid vehicle id.");

			// Check if rentalType was specified
			if (model.RentalType == null)
				return new HttpStatusCodeResult(400, "No valid rental period specified.");

			// Check if startTime was specified and is valid
			if (model.StartTime < DateTime.Now.AddHours(Models.Constants.SOONEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_HOUR)
					|| model.StartTime > DateTime.Now.AddDays(Models.Constants.LATEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_DAY))
				return new HttpStatusCodeResult(400, "No valid rental period specified.");

			var vehicleService = this.Service<IVehicleService>();
			var vehicle = vehicleService.Get(v => v.ID == model.VehicleID.Value
												&& !v.IsDeleted
												&& v.Garage.IsActive
												&& v.Garage.AspNetUser.AspNetRoles.Any(r => r.Name == "Provider")
												&& (v.Garage.AspNetUser.LockoutEndDateUtc == null || v.Garage.AspNetUser.LockoutEndDateUtc < DateTime.UtcNow)
												&& v.VehicleGroup != null
												&& v.VehicleGroup.IsActive
				).FirstOrDefault();

			// Check if vehicle exists
			if (vehicle == null)
				return new HttpStatusCodeResult(400, "Invalid vehicle id.");

			// Deduce the endtime / priceGroupItem based on acquired model
			DateTime endTime;
			PriceGroupItem priceGroupItem = null;
			if (model.RentalType.Value == 0)
			{
				// Check if numOfDay exists and is valid 
				if (model.NumOfDay == null || model.NumOfDay < 1 || model.NumOfDay > vehicle.VehicleGroup.PriceGroup.MaxRentalPeriod)
					return new HttpStatusCodeResult(400, "No valid rental period specified.");

				endTime = model.StartTime.AddDays(model.NumOfDay.Value);
			}
			else
			{
				// Check if priceGroupItem exists
				priceGroupItem = vehicle.VehicleGroup.PriceGroup.PriceGroupItems.FirstOrDefault(r => r.MaxTime == model.RentalType.Value);
				if (priceGroupItem == null)
					return new HttpStatusCodeResult(400, "No valid rental period specified.");

				endTime = model.StartTime.AddHours(model.RentalType.Value);
			}

			// Check if startTime is after SoonestPossibleBookingStartTimeFromNow
			if (model.StartTime < DateTime.Now.AddHours(Constants.SOONEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_HOUR))
				return Json(new
				{
					errorCode = 403,
					message = "Thời gian nhận xe phải sau thời gian hiện tại ít nhất "
					+ Constants.SOONEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_HOUR + " tiếng."
				}, JsonRequestBehavior.AllowGet);

			// Check if startTime is before LatestPossibleBookingStartTimeFromNow
			if (model.StartTime > DateTime.Now.AddDays(Constants.LATEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_DAY))
				return Json(new
				{
					errorCode = 403,
					message = "Dịch vụ của chúng tôi hiện tại chỉ nhận đặt xe trong vòng "
						+ Constants.LATEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_DAY
						+ " ngày kể từ thời gian hiện tại."
				}, JsonRequestBehavior.AllowGet);
			
			// Check StartTime/EndTime to be within garage's OpenTime ~ CloseTime
			// Compare by convert time to the number of minute from 00:00
			// Max margin of error: 60 secs vs CloseTime (Because we do not validate to second)

			// Booking StartTime
			var startTimeDoW = (int)model.StartTime.DayOfWeek;
			var startTimeInMinute = model.StartTime.Minute + model.StartTime.Hour * 60;
			if (!vehicle.Garage.GarageWorkingTimes.Any(gwt => gwt.DayOfWeek == startTimeDoW
														&& startTimeInMinute >= gwt.OpenTimeInMinute
														&& startTimeInMinute <= gwt.CloseTimeInMinute))
				return Json(new
				{
					errorCode = 403,
					message = "Thời gian nhận xe không nằm trong thời gian hoạt động của cửa hàng."
				}, JsonRequestBehavior.AllowGet);

			// Booking EndTime
			var endTimeDoW = (int)endTime.DayOfWeek;
			var endTimeInMunute = endTime.Minute + endTime.Hour * 60;
			if(!vehicle.Garage.GarageWorkingTimes.Any(gwt => gwt.DayOfWeek == endTimeDoW
												&& endTimeInMunute >= gwt.OpenTimeInMinute
												&& endTimeInMunute <= gwt.CloseTimeInMinute))
				return Json(new
				{
					errorCode = 403,
					message = "Thời gian trả xe không nằm trong thời gian hoạt động của cửa hàng."
				}, JsonRequestBehavior.AllowGet);

			// Check if this vehicle has any other bookings in the timespan of this booking
			var needCheckingStartTime = model.StartTime.AddHours(-Constants.IN_BETWEEN_BOOKING_REST_TIME_IN_HOUR);
			var needCheckingEndTime = endTime.AddHours(Constants.IN_BETWEEN_BOOKING_REST_TIME_IN_HOUR);
			if (vehicle.BookingReceipts.Any(br => !br.IsCanceled && (
								(needCheckingStartTime > br.StartTime
									&& needCheckingStartTime < br.EndTime)
							 || (needCheckingEndTime > br.StartTime
									&& needCheckingEndTime < br.EndTime)
							 || (needCheckingStartTime <= br.StartTime
									&& needCheckingEndTime >= br.EndTime)
						)))
				return Json(new
				{
					errorCode = 403,
					message = "Xe đã được đặt trong thời gian bạn đã chọn."
				}, JsonRequestBehavior.AllowGet);

			// All validation passed. Create new receipt with isPending = true
			var bookingService = this.Service<IBookingReceiptService>();
			var newBooking = this.Mapper.Map<BookingReceipt>(vehicle);
			newBooking.ID = 0;
			newBooking.CustomerID = User.Identity.GetUserId();
			newBooking.Garage.OwnerID = vehicle.Garage.AspNetUser.Id;
			newBooking.VehicleID = vehicle.ID;

			newBooking.GaragePhone = vehicle.Garage.Phone1;
			newBooking.VehicleName = vehicle.Name;
			newBooking.GarageAddress = vehicle.Garage.Address + ", " + vehicle.Garage.Location.Name;
			newBooking.Star = null;

			newBooking.StartTime = model.StartTime;
			newBooking.EndTime = endTime;
			newBooking.BookingTime = DateTime.Now;

			newBooking.IsPending = true;

			if (model.RentalType.Value == 0)
			{
				newBooking.RentalPrice = vehicle.VehicleGroup.PriceGroup.PerDayPrice*model.NumOfDay.Value;
				newBooking.Distance = vehicle.VehicleGroup.PriceGroup.MaxDistancePerDay != null
					? vehicle.VehicleGroup.PriceGroup.MaxDistancePerDay*model.NumOfDay.Value
					: null;
			}
			else
			{
				newBooking.RentalPrice = priceGroupItem.Price;
				newBooking.Distance = priceGroupItem.MaxDistance;
			}

			newBooking.Deposit = newBooking.RentalPrice * (double)vehicle.VehicleGroup.PriceGroup.DepositPercentage;
			newBooking.BookingFee = newBooking.RentalPrice * Constants.BOOKING_FEE_PERCENTAGE;

			bookingService.Create(newBooking);

			// Set timer to delete the booking if it is still pending after x-milisec
			var checkPendingBookingTimer = new System.Timers.Timer((Constants.BOOKING_CONFIRM_TIMEOUT_IN_MINUTES + Constants.BOOKING_PAYMENT_TIMEOUT_IN_MINUTES) * 60*1000)
			{
				AutoReset = false
			};

			// Add callback
			checkPendingBookingTimer.Elapsed += delegate { CheckPendingBooking(newBooking.ID); };
			checkPendingBookingTimer.Start();
			
			return JavaScript("window.location = '/bookingConfirm/" + newBooking.ID + "'");
		}

		// Handler for TryBookingApi
		// Remove booking if it is still pending upon called
		private static void CheckPendingBooking(int bookingID)
		{
			var dbContext = new CRPEntities();
			var bookingService = new BookingReceiptService(new UnitOfWork(dbContext), new BookingReceiptRepository(dbContext));
			var bookingReceipt = bookingService.Get(bookingID);

			if(bookingReceipt != null && bookingReceipt.IsPending)
				bookingService.Delete(bookingReceipt);
		}

		// Route to bookingConfirm page (Page for confirming booking details before paying)
		[System.Web.Http.HttpGet]
		[System.Web.Mvc.Route("bookingConfirm/{bookingID}", Name = "BookingConfirm")]
		public System.Web.Mvc.ActionResult BookingConfirm(int bookingID)
		{
			var userID = User.Identity.GetUserId();
			var fiveMinuteAgo = DateTime.Now.AddMinutes(-Constants.BOOKING_CONFIRM_TIMEOUT_IN_MINUTES);
			var bookingReceipt = this.Service<IBookingReceiptService>()
					.Get(br => br.IsPending == true
							&& br.CustomerID == userID
							&& br.ID == bookingID
							&& br.BookingTime > fiveMinuteAgo
					).FirstOrDefault();

			if (bookingReceipt == null)
				return new HttpStatusCodeResult(403, "Access denied.");

			var bookingConfirmViewModel = new BookingConfirmViewModel {Receipt = bookingReceipt, NganLuong = new NganLuongPaymentModel()};
			bookingConfirmViewModel.NganLuong.OrderCode = bookingReceipt.ID.ToString();

			return View("~/Areas/Customer/Views/Booking/BookingConfirm.cshtml", bookingConfirmViewModel);
		}

		// Route for paying with nganluong
		[System.Web.Http.HttpPost]
		[ValidateAntiForgeryToken]
		[System.Web.Mvc.Route("bookingConfirm", Name = "BookVehicle")]
		public System.Web.Mvc.ActionResult BookVehicle(BookingConfirmViewModel bookingModel, NganLuongPaymentModel nganLuongPayment)
		{
			var user = HttpContext.GetOwinContext()
					.GetUserManager<ApplicationUserManager>()
					.FindById(HttpContext.User.Identity.GetUserId());

			// Check if the request contains all valid params
			if (bookingModel?.Action == null || bookingModel.Receipt?.ID == null || nganLuongPayment == null)
				return new HttpStatusCodeResult(400, "Invalid request");

			var bookingService = this.Service<IBookingReceiptService>();
			var bookingReceipt = bookingService.Get(br => br.ID == bookingModel.Receipt.ID
														&& br.CustomerID == user.Id
														&& br.IsPending).FirstOrDefault();

			if (bookingReceipt == null)
				return new HttpStatusCodeResult(400, "Invalid request");

			// Act based on the received action's name
			switch (bookingModel.Action)
			{
				case "delete":
					bookingService.Delete(bookingReceipt);
					return RedirectToAction("Index", "Home");
				case "change":
					var vehicleID = bookingReceipt.VehicleID;
					bookingService.Delete(bookingReceipt);
					return RedirectToAction("VehicleInfo", "Home", new {id = vehicleID});
				case "pay":
					break;
				default:
					return new HttpStatusCodeResult(400, "Bad request");
			}

			// Only "pay" action left to handle
			// Now validate nganluong params before redirect to nganluong

			var info = new RequestInfoTestTemplate
			{
				bank_code = nganLuongPayment.BankCode,
				Order_code = nganLuongPayment.OrderCode,
				order_description = "Test booking",
				return_url = "http://localhost:65358/bookingReceipt",
				cancel_url = "http://localhost:65358/bookingReceipt?canceledBookingID=" + bookingModel.Receipt.ID,
				Buyer_fullname = user.FullName,
				Buyer_email = user.Email,
				Buyer_mobile = user.PhoneNumber,
				time_limit = Constants.BOOKING_CONFIRM_TIMEOUT_IN_MINUTES.ToString()
			};
			
			var objNLCheckout = new APICheckoutV3();
			var result = objNLCheckout.GetUrlCheckout(info, nganLuongPayment.PaymentMethod);

			if (result.Error_code == "00")
			{
				return Redirect(result.Checkout_url);
			}

			return new HttpStatusCodeResult(400, "Invalid request");
		}

		//Route to bookingReceipt page(Redirect from NganLuong/BaoKim after customer has payed)
		[System.Web.Mvc.Route("bookingReceipt", Name = "BookingReceipt")]
		public async Task<System.Web.Mvc.ActionResult> BookingReceipt(string error_code, string token, int? canceledBookingID = null)
		{
			var userID = User.Identity.GetUserId();
			var bookingService = this.Service<IBookingReceiptService>();
			
			// If the customer cancel the booking, delete it and redirect him to homepage
			if (canceledBookingID != null)
			{
				var bookingReceipt = bookingService.Get(br => br.CustomerID == userID
													&& br.ID == canceledBookingID
													&& br.IsPending == true).FirstOrDefault();

				if (bookingReceipt == null)
					return new HttpStatusCodeResult(400, "Invalid request");

				bookingService.Delete(bookingReceipt);
				return RedirectToAction("Index", "Home");
			}
			
			// If the transaction went smoothy, check the returned info + MD5 token
			var info = new RequestCheckOrderTestTemplate {Token = token};
			var objNLCheckout = new APICheckoutV3();
			var result = objNLCheckout.GetTransactionDetail(info);

			if (result.errorCode == "00")
			{
				// Try to get the bookingReceiptID
				try
				{
					var bookingID = int.Parse(result.order_code);

					var bookingReceipt = bookingService.Get(br => br.CustomerID == userID
													&& br.ID == bookingID
													&& br.IsPending == true).FirstOrDefault();

					if (bookingReceipt == null)
						return new HttpStatusCodeResult(400, "Invalid request");
					
					bookingReceipt.IsPending = false;
					bookingService.Update(bookingReceipt);

					// Send alert email
					SystemService sysService = new SystemService();
					await sysService.SendBookingAlertEmailToCustomer(bookingReceipt);
					await sysService.SendBookingAlertEmailToProvider(bookingReceipt);

					return View("~/Areas/Customer/Views/Booking/BookingReceipt.cshtml", bookingReceipt);
				}
				catch (FormatException e)
				{
					return new HttpStatusCodeResult(400, "Invalid request");
				}
			}

			return new HttpStatusCodeResult(400, "Invalid request");
		}

		// Route to bookingHistory page
		[System.Web.Mvc.Route("management/bookingHistory")]
		public ViewResult BookingHistory()
		{
			return View("~/Areas/Customer/Views/Booking/BookingHistory.cshtml");
		}

		// API route for getting this user's booking receipts
		// Pagination needed
		// Order by startTime, from newer to older
		[System.Web.Mvc.Route("api/bookings/bookingHistory", Name = "GetBookingHistoryAPI")]
		[System.Web.Mvc.HttpGet]
		public System.Web.Mvc.ActionResult GetBookingHistoryAPI(int? draw, int page = 1, int recordPerPage = Constants.NUM_OF_SEARCH_RESULT_PER_PAGE)
		{
			if (page < 1 || recordPerPage < 0 || draw == null)
				return new HttpStatusCodeResult(400, "Invalid request");

			var bookingService = this.Service<IBookingReceiptService>();
			var receiptList = bookingService.GetBookingHistory(User.Identity.GetUserId(), page, recordPerPage, draw.Value);

			return Json(receiptList, JsonRequestBehavior.AllowGet);
		}

		// API route for canceling a booking
		[System.Web.Mvc.Route("api/bookings/{id:int}")]
		[System.Web.Mvc.HttpDelete]
		public async Task<System.Web.Mvc.ActionResult> CancelBookingAPI(int id)
		{
			var bookingService = this.Service<IBookingReceiptService>();
			var booking = await bookingService.GetAsync(id);

			if (booking == null)
				return new HttpStatusCodeResult(400, "Invalid request");

			if (booking.CustomerID != User.Identity.GetUserId())
				return new HttpStatusCodeResult(403, "No access");

			if(booking.IsCanceled)
				return new HttpStatusCodeResult(400, "Invalid request");
			
			// Send alert emails
			var systemService = new SystemService();
			await systemService.SendBookingCanceledAlertEmailToCustomer(booking);
			await systemService.SendBookingCanceledAlertEmailToProvider(booking);

			booking.IsCanceled = true;
			await bookingService.UpdateAsync(booking);

			return new HttpStatusCodeResult(200, "OK");
		}

		// API route for sending comment/rating for a booking
		[System.Web.Mvc.Route("api/bookings")]
		[System.Web.Mvc.HttpPatch]
		public async Task<System.Web.Mvc.ActionResult> RateBookingAPI(BookingCommentModel comment)
		{
			// Validate the comment model
			if(comment?.ID ==null || comment.Comment == null
					|| comment.Comment.Length < BookingCommentModel.MIN_COMMENT_LENGTH
					|| comment.Comment.Length > BookingCommentModel.MAX_COMMENT_LENGTH
					|| comment.Star < BookingCommentModel.MIN_RATING
					|| comment.Star > BookingCommentModel.MAX_RATING)
				return new HttpStatusCodeResult(400, "Bad request");

			var service = this.Service<IBookingReceiptService>();
			var booking = await service.GetAsync(comment.ID);

			if (booking.CustomerID != User.Identity.GetUserId())
				return new HttpStatusCodeResult(403, "Access denied.");

			// Only allow commenting after the rental has started or been canceled
			if (DateTime.Now < booking.StartTime && !booking.IsCanceled)
				return new HttpStatusCodeResult(400, "This booking has yet to complete.");

			if (booking.Star.HasValue)
				return new HttpStatusCodeResult(400, "This booking has already been rated");

			booking.Comment = comment.Comment;
			booking.Star = comment.Star;

			// Update vehicle's rating and NumOfComment
			booking.Vehicle.Star = (booking.Vehicle.Star*booking.Vehicle.NumOfComment + comment.Star)
									/ ++booking.Vehicle.NumOfComment;

			// Update garage's rating and NumOfComment
			booking.Garage.Star = (booking.Garage.Star * booking.Garage.NumOfComment + comment.Star)
									/ ++booking.Garage.NumOfComment;

			await service.UpdateAsync(booking);

			return new HttpStatusCodeResult(200, "OK");
		}
	}
}