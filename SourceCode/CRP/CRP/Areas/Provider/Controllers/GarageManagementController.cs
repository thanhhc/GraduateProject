using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CRP.Models;
using CRP.Models.Entities;
using CRP.Models.Entities.Services;
using Newtonsoft.Json;
using CRP.Controllers;
using AutoMapper.QueryableExtensions;
using System.Threading.Tasks;
using System.Web.Security;
using Microsoft.AspNet.Identity;
using CRP.Models.ViewModels;

namespace CRP.Areas.Provider.Controllers
{
	[Authorize(Roles = "Provider")]
	public class GarageManagementController : BaseController
	{
		// Route to garageManagement page
		[Route("management/garageManagement")]
		public ViewResult GarageManagement()
		{
			var locationService = this.Service<ILocationService>();
			GarageModel garageModel = new GarageModel();

			garageModel.listLocation = locationService.Get()
				.Select(q => new SelectListItem()
				{
					Text = q.Name,
					Value = q.ID.ToString(),
					Selected = false,
				});

			return View("~/Areas/Provider/Views/GarageManagement/GarageManagement.cshtml", garageModel);
		}

		// Route to garage's detailed info page
		[Route("management/garageManagement/{id:int}")]
		public ViewResult GarageManagement(int id)
		{
			var service = this.Service<IGarageService>();
			var locationService = this.Service<ILocationService>();
			var garage = service.Get(id);
			if(garage == null)
			{
				return View("~/Areas/Provider/Views/GarageManagement/GarageDetail.cshtml");
			}
			var garageModel = this.Mapper.Map<GarageModel>(garage);
			garageModel.listLocation= locationService.Get()
				.Select(q => new SelectListItem()
				{
					Text = q.Name,
					Value = q.ID.ToString(),
					Selected = false,
				});

			return View("~/Areas/Provider/Views/GarageManagement/GarageDetail.cshtml", garageModel);
		}

		// API Route to get list of garage
		[Route("api/garages")]
		[HttpGet]
		public JsonResult GetGarageListAPI()
		{
			string providerID = User.Identity.GetUserId();
			var service = this.Service<IGarageService>();
			var list = service.Get(q => q.OwnerID == providerID && !q.IsDeleted).ToList();
			var result = list.Select(q => new IConvertible[] {
				q.ID,
				q.Name,
				q.Address,
				q.Location.Name,
				q.Vehicles.Count,
				q.Star,
				q.NumOfComment,
				q.IsActive,
			});
			return Json(new { aaData = result }, JsonRequestBehavior.AllowGet);
		}

		// update garage of a vehicle
		[Route("api/garage/updateVehicle/{vehicleID:int}/{garageID:int}")]
		[HttpPatch]
		public async Task<JsonResult> UpdateVehicleInGarage(int vehicleID, int garageID)
		{
			if (!this.ModelState.IsValid)
			{
				return Json(new { result = false, message = "Invalid!" });
			}
			var service = this.Service<IVehicleService>();
			var vehicle = service.Get(vehicleID);
			if (garageID != 0)
			{
				vehicle.GarageID = garageID;
			}

			await service.UpdateAsync(vehicle);
			return Json(new { result = true, message = "Update done!" });
		}

		// API Route to create single new garage
		// garageViewModel
		[Route("api/garages")]
		[HttpPost]
		public async Task<ActionResult> CreateGarageAPI(Garage model)
		{
			model.OwnerID = User.Identity.GetUserId();
			model.IsActive = true;
			model.Star = 0m;
			model.NumOfComment = 0;
			var service = this.Service<IGarageService>();
			
			await service.CreateAsync(model);

			return Json(new { result = true, message = "Created successfully." });
		}

		// API Route to edit single garage
		// GarageViewModel
		[Route("api/garages")]
		[HttpPatch]
		public async Task<ActionResult> EditGarageAPI(Garage model)
		{
			if (!this.ModelState.IsValid)
				return Json(new { result = false, message = "Updated unsuccessfully" });

			var service = this.Service<IGarageService>();
			var WTService = this.Service<IGarageWorkingTimeService>();
			var entity = await service.GetAsync(model.ID);
			if(entity == null)
				return Json(new { result = false, message = "Updated unsuccessfully" });

			entity.Name = model.Name;
			entity.LocationID = model.LocationID;
			entity.Address = model.Address;
			entity.Email = model.Email;
			entity.Phone1 = model.Phone1;
			entity.Phone2 = model.Phone2;
			entity.Description = model.Description;
			entity.Policy = model.Policy;
			entity.GarageWorkingTimes = model.GarageWorkingTimes;

			var workTime = WTService.Get(q => q.GarageID == model.ID);
			if(workTime.Any())
			{
				foreach(var w in workTime)
				{
					WTService.DeleteAsync(w);
				}
			}

			await service.UpdateAsync(entity);

			return Json(new { result = true, message = "Updated successfully" });
		}

		// API Route to delete single garage
		//[Route("api/garages/{id:int}")]
		//[HttpDelete]
		//public async Task<ActionResult> DeleteGarageAPI(int id)
		//{
		//	var service = this.Service<IGarageService>();
		//	var entity = await service.GetAsync(id);
		//	if (entity == null)
		//		return HttpNotFound();

		//	await service.DeleteAsync(entity);
			
		//	return new HttpStatusCodeResult(200, "Deleted successfully.");
		//}

	   
		//[HttpGet]
		//public ViewResult CreateGarage()
		//{
		//    var locationService = this.Service<ILocationService>();
		//    List<Location> lstLocation = new List<Location>();
		//    lstLocation = locationService.Get().ToList();
		//    ViewBag.locationList = lstLocation;
		//    createNewGarageViewModel viewModel = new createNewGarageViewModel();
		//    return View("~/Areas/Provider/Views/VehicleGroupManagement/CreatePopup.cshtml", viewModel);
		//}
		
		[Route("api/workingTime/{id:int}")]
		[HttpGet]
		public JsonResult WorkingTime(int id)
		{
			var service = this.Service<IGarageWorkingTimeService>();
			var workingTimeList = service.Get().ToList();
			var result = workingTimeList
				.Where(q => q.GarageID == id)
				.Select(q => new IConvertible[] {
					q.DayOfWeek,
					q.OpenTimeInMinute,
					q.CloseTimeInMinute
				});
			return Json(new { list = result }, JsonRequestBehavior.AllowGet);
		}

		[Route("api/deleteGarage/{id:int}")]
		[HttpDelete]
		public async Task<JsonResult> DeleteVehicleGroupAPI(int id)
		{
			var service = this.Service<IGarageService>();
			var garageWTService = this.Service<IGarageWorkingTimeService>();

			var garageEntity = await service.GetAsync(id);

			if(garageEntity == null)
				return Json(new { result = false, message = "Không tìm thấy garage." });
			if (garageEntity.Vehicles.Any(v => !v.IsDeleted))
				return Json(new { result = false, message = "Vẫn còn xe trong garage, vui lòng di chuyển tất cả xe qua garage khác trước khi xóa!" });

			var garageWorkingTimes = garageWTService.Get(wt => wt.GarageID == id);
			foreach (var item in garageWorkingTimes)
			{
				garageWTService.DeleteAsync(item);
			}

			garageEntity.IsDeleted = true;
			await service.UpdateAsync(garageEntity);
			return Json(new { result = true, message = "Done!" });
		}

		// load vehicle in garage
		[Route("api/vehicleInGarage/{id:int}")]
		[HttpGet]
		public JsonResult GetVehicleInGarage(int id)
		{
			var providerID = User.Identity.GetUserId();
			var service = this.Service<IVehicleService>();
			var list = service.Get(q => q.Garage.OwnerID == providerID && q.GarageID == id && !q.IsDeleted).ToList();
			var result = list.Select(q => new IConvertible[] {
				q.ID,
				q.Name,
				q.LicenseNumber,
				q.VehicleGroup != null ? q.VehicleGroup.Name: null,
				q.Year,
				q.VehicleModel.NumOfSeat,
				//(from kvp in Models.Constants.COLOR where kvp.Key == q.Color select kvp.Value).ToList().FirstOrDefault(),
				q.Star,
				q.NumOfComment
			});
			return Json(new { data = result }, JsonRequestBehavior.AllowGet);
		}

		// load all vehicle in other garage
		[Route("api/vehicleListGarage/{garageID:int}")]
		[HttpGet]
		public JsonResult VehiclesInOtherGarage(int garageID)
		{
			var service = this.Service<IVehicleService>();
			var providerID = User.Identity.GetUserId();

			var listVehicle = service.Get(q => q.Garage.OwnerID == providerID && q.GarageID != garageID && !q.IsDeleted)
				.Select(q => new SelectListItem()
				{
					Text = q.Name + " [Biển số: " + q.LicenseNumber + "]" + "[Garage: " + q.Garage.Name + "]",
					Value = q.ID.ToString(),
					Selected = false,
				}).ToList();
			return Json(new { list = listVehicle }, JsonRequestBehavior.AllowGet);
		}

		[Route("api/garage/status/{id:int}")]
		[HttpPatch]
		public async Task<JsonResult> ChangeStatus(int id)
		{
			var service = this.Service<IGarageService>();
			var entity = await service.GetAsync(id);
			if (entity != null)
			{
				entity.IsActive = !entity.IsActive;
				await service.UpdateAsync(entity);
				return Json(new { result = true, message = "Đã thay đổi thành công!" });
			}

			return Json(new { result = false, message = "Có lỗi xảy ra!" });
		}

		[Route("management/GarageManagement/create")]
		[HttpPost]
		[ValidateAntiForgeryToken]
		public ActionResult Create(createNewGarageViewModel model)
		{
			if (ModelState.IsValid)
			{
				var service = this.Service<IGarageService>();
				var garage = new Garage
				{
					Name = model.GarageName,
					Address = model.Address,
					Email = model.Email,
					Phone1 = model.PhoneNumber,
					LocationID = int.Parse(model.LocationID),
					OwnerID = User.Identity.GetUserId(),
					IsActive = true
				};
				service.Create(garage);
				return RedirectToAction("GarageManagement", "GarageManagement");
			}

			// If we got this far, something failed, redisplay form
			return new HttpStatusCodeResult(403, "Created unsuccessfully.");
		}

		//// GET: Brand
		public ActionResult Index()
		{
			var service = this.Service<IGarageService>();
			List<Garage> lstGara = new List<Garage>();
			lstGara = service.Get().ToList();
			ViewBag.garaList = lstGara;
			return View();
		}

		//cai nay la de format thanh datetime cho may cai open close
		DateTime toDay = new DateTime();
		TimeSpan hourMinute = new TimeSpan();
		public DateTime setDayFromParam(String param)
		{
			hourMinute = TimeSpan.Parse(param);
			DateTime dateTime = toDay.Date + hourMinute;
			return dateTime.AddYears(2016);
		}
	}
}