using CRP.Controllers;
using CRP.Models;
using CRP.Models.Entities;
using CRP.Models.Entities.Repositories;
using CRP.Models.Entities.Services;
using CRP.Models.ViewModels;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
namespace CRP.Areas.Admin.Controllers
{
	[Authorize(Roles = "Admin")]
	public class UserManagementController : BaseController
	{
		// Route to userManagement page
		[Route("management/userManagement")]
		public ViewResult UserManagement()
		{
			return View("~/Areas/Admin/Views/UserManagement/UserManagement.cshtml");
		}

		// API route for toggling isActive (Deactivate/Reactivate) of an account
		[Route("api/user/toggleIsActive/{id:int}")]
		[HttpPatch]
		public JsonResult ToogleIsActiveAPI(int id)
		{
			return Json("");
		}

		// API Route to get list of garage
		[Route("api/UserManagement")]
		[HttpGet]
		public JsonResult GetUserListAPI()
		{
			List<UserViewModel> lstUser = new List<UserViewModel>();
			var service = this.Service<IUserService>();
			List<AspNetUser> list = service.Get().ToList();
			foreach (AspNetUser item in list)
			{
				UserViewModel viewModel = new UserViewModel();
				viewModel.ID = item.Id;
				viewModel.UserName = item.UserName;
				viewModel.Email = item.Email;
				viewModel.phoneNumber = item.PhoneNumber;
				if (item.AspNetRoles.Any(q => q.Name == "Provider"))
				{
					viewModel.role = "Provider";
				} else if (item.AspNetRoles.Any(q => q.Name == "Admin")) {
					viewModel.role = "Admin";
				} else
				{
					viewModel.role = "Customer";
				};
				if (!item.IsProviderUntil.HasValue)
				{
					viewModel.providerUtil = "";
				} else
				{
					viewModel.providerUtil = item.IsProviderUntil.ToString() ;
				}
				if (item.LockoutEnabled == true && item.LockoutEndDateUtc > DateTime.UtcNow)
				{
					viewModel.status = false;
				}
				else
				{
					viewModel.status = true;
				}

				if(viewModel.role != "Admin")
				{
					lstUser.Add(viewModel);
				}
			}
			return Json(new { aaData = lstUser }, JsonRequestBehavior.AllowGet);
		}

		[Route("api/user/status")]
		[HttpPatch]
		public async Task<JsonResult> ChangeStatus()
		{
			var ID = Request.Params["id"];
			var service = this.Service<IUserService>();
			var entity = await service.GetAsync(ID);

			if (entity == null) return Json(new {result = false, message = "Có lỗi xảy ra!"});

			if (entity.AspNetRoles.Any(q => q.Name == "Admin")) return Json(new { result = false, message = "Có lỗi xảy ra!" });

			entity.LockoutEnabled = !entity.LockoutEnabled;

			if (entity.LockoutEndDateUtc == null || entity.LockoutEndDateUtc < DateTime.UtcNow)
			{
				entity.LockoutEndDateUtc = DateTime.UtcNow.AddYears(100);
			}
			else
			{
				entity.LockoutEndDateUtc = DateTime.UtcNow.AddYears(-100);
			}

			await service.UpdateAsync(entity);

			return Json(new { result = true, message = "Đã thay đổi thành công!" });
		}
	}
}