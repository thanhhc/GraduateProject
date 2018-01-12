using CRP.Controllers;
using CRP.Models;
using CRP.Models.Entities;
using CRP.Models.Entities.Services;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using API_NganLuong;
using CRP.Models.ViewModels;
using Microsoft.AspNet.Identity.Owin;
using Constants = CRP.Models.Constants;

namespace CRP.Areas.Customer.Controllers
{
    [Authorize(Roles = "Customer")]
    public class BecomeProviderController : BaseController
	{
		// BecomeProvider page
		[System.Web.Mvc.Route("becomeProvider", Name = "BecomeProvider")]
		public ActionResult Index()
		{
			return View("~/Areas/Customer/Views/BecomeProvider/Index.cshtml");
		}

		// Process payment from BecomeProvider
		// Redirect to NganLuong to handle payment
		// Return to /becomeProvider/success
		[System.Web.Http.HttpPost]
		[ValidateAntiForgeryToken]
		[System.Web.Mvc.Route("becomeProvider/payment", Name = "GetProvidership")]
		public async System.Threading.Tasks.Task<ActionResult> GetProvidership(NganLuongPaymentModel nganLuongPayment)
		{
			// Check if the request contains all valid params
			int plan;
			if (nganLuongPayment?.OrderCode == null
					|| !int.TryParse(nganLuongPayment.OrderCode, out plan)
					|| !Constants.PROVIDER_PLAN.Contains(plan))
				return new HttpStatusCodeResult(400, "Invalid request");

			// Get current user
			var customerID = User.Identity.GetUserId();
			var userService = this.Service<IUserService>();
			var user = await userService.GetAsync(customerID);

			// Calculate the date of IsProviderUntil
			// We will save it into Order_code and then get it back on success
			// To validate and set the new IsProviderUntil of user
			DateTime newIsProviderUntil;
			if (user.IsProviderUntil == null || user.IsProviderUntil < DateTime.Now)
			{
				newIsProviderUntil = DateTime.Now.AddDays(30*plan);
			}
			else
			{
				newIsProviderUntil = user.IsProviderUntil.Value.AddDays(30 * plan);
			}

			//  validate nganluong params before redirect to nganluong
			var info = new RequestInfoTestTemplate
			{
				bank_code = nganLuongPayment.BankCode,
				Order_code = user.Id + " - " + newIsProviderUntil.ToString(),
				order_description = "Test becomeProvider, plan = " + plan + "months",
				return_url = "http://localhost:65358/becomeProvider/success",
				cancel_url = "http://localhost:65358/",
				Buyer_fullname = user.FullName,
				Buyer_email = user.Email,
				Buyer_mobile = user.PhoneNumber
			};

			var objNLCheckout = new APICheckoutV3();
			var result = objNLCheckout.GetUrlCheckout(info, nganLuongPayment.PaymentMethod);

			if (result.Error_code == "00")
			{
				return Redirect(result.Checkout_url);
			}

			return new HttpStatusCodeResult(400, "Invalid request");
		}

		// Return page for successful payment from nganluong
		[System.Web.Mvc.Route("becomeProvider/success")]
		public async System.Threading.Tasks.Task<ActionResult> Success(string error_code, string token)
		{
			// Check the returned info + MD5 token
			var info = new RequestCheckOrderTestTemplate {Token = token};
			var objNLCheckout = new APICheckoutV3();
			var result = objNLCheckout.GetTransactionDetail(info);

			if (result.errorCode == "00")
			{
				// Try to get the new IsProviderUntil datetime
				try
				{
					// Separate the userID and IsProviderUntil Datetime from order_code
					var words = result.order_code.Split(new[] { " - " }, StringSplitOptions.None);

					if(words.Length != 2)
						return new HttpStatusCodeResult(400, "Invalid request");

					var userID = words[0];
					// Get current user
					var userService = this.Service<IUserService>();
					var user = await userService.GetAsync(userID);

					// Validate the user
					if (user == null)
						return new HttpStatusCodeResult(400, "Invalid request");

					var isProviderUntil = DateTime.Parse(words[1]);

					// Validate the new datetime
					if (isProviderUntil < DateTime.Now)
						return new HttpStatusCodeResult(400, "Invalid request");
					
					

					user.IsProviderUntil = isProviderUntil;

					// Add role provider if the user havent already had that role
					if (user.AspNetRoles.All(r => r.Name != "Provider"))
					{
						var providerRole = await this.Service<IRoleService>().GetAsync("2");
						user.AspNetRoles.Add(providerRole);
					}

					userService.Update(user);

					// Send alert email
					var sysService = new SystemService();
					await sysService.SendBecomeProviderAlertEmail(user.Email, user);

					return View("~/Areas/Customer/Views/BecomeProvider/Success.cshtml", user);
				}
				catch (FormatException e)
				{
					return new HttpStatusCodeResult(400, "Invalid request");
				}
			}

			return new HttpStatusCodeResult(400, "Invalid request");
		}
	}
}