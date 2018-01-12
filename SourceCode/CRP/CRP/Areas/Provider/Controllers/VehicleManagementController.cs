using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CRP.Models.ViewModels;
using CRP.Models.Entities.Services;
using CRP.Models.Entities;
using CRP.Models.JsonModels;
using CRP.Controllers;
using CRP.Models;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using CloudinaryDotNet.Actions;
using Microsoft.Ajax.Utilities;
using System.IO;
using Constants = CRP.Models.Constants;

namespace CRP.Areas.Provider.Controllers
{
	[Authorize(Roles = "Provider")]
	public class VehicleManagementController : BaseController
	{

		// Route to vehicleManagement page
		[Route("management/vehicleManagement")]
		public ViewResult VehicleManagement()
		{
			var brandService = this.Service<IBrandService>();
			var brandList = brandService.Get(
				b => b.ID != 0 // Exclude Unlisted
					&& b.VehicleModels.Count != 0 // Only get brand w/ model
			).OrderBy(b => b.Name).ToList();

			var garageService = this.Service<IGarageService>();
			var providerID = User.Identity.GetUserId();
			var listGarage = garageService.Get(q => q.OwnerID == providerID && !q.IsDeleted)
				.Select(q => new SelectListItem()
				{
					Text = q.Name,
					Value = q.ID.ToString(),
					Selected = true,
				});

			var groupService = this.Service<IVehicleGroupService>();
			var groupList = groupService.Get(q => q.OwnerID == providerID)
				.Select(q => new SelectListItem()
				{
					Text = q.Name,
					Value = q.ID.ToString()
				});

			var viewModel = new FilterByGarageView()
			{
				listGarage = listGarage,
				GroupList = groupList,
				BrandList = brandList
			};

			return View("~/Areas/Provider/Views/VehicleManagement/VehicleManagement.cshtml", viewModel);
		}

		// Load listOtherGarage
		[Route("api/listOtherGarage/{garageID:int}")]
		[HttpGet]
		public JsonResult LoadOtherGarage(int garageID)
		{
			var service = this.Service<IGarageService>();
			FilterByGarageView garageView = new FilterByGarageView();
			var providerID = User.Identity.GetUserId();
			garageView.listGarage = service.Get(q => q.OwnerID == providerID && q.IsActive && q.ID != garageID && !q.IsDeleted)
				.Select(q => new SelectListItem()
				{
					Text = q.Name,
					Value = q.ID.ToString(),
					Selected = true,
				});

			return Json(new {list = garageView.listGarage}, JsonRequestBehavior.AllowGet);
		}


		[Route("api/listGroup")]
		[HttpGet]
		public JsonResult LoadGroupList()
		{
			var service = this.Service<IVehicleGroupService>();
			// just use it to return a list not for keeping data purpose
			FilterByGarageView garageView = new FilterByGarageView();
			var providerID = User.Identity.GetUserId();
			garageView.listGarage = service.Get(q => q.OwnerID == providerID)
				.Select(q => new SelectListItem()
				{
					Text = q.Name + " [" + (q.IsActive ? "đang hoạt động" : "ngưng hoạt động") + "]",
					Value = q.ID.ToString(),
					Selected = true,
				});

			return Json(new {list = garageView.listGarage}, JsonRequestBehavior.AllowGet);
		}

		// Route to vehicle's detailed info page
		[Route("management/vehicleManagement/{id:int}")]
		public ActionResult VehihicleDetail(int id)
		{
			var providerID = User.Identity.GetUserId();

			var vehicleService = this.Service<IVehicleService>();
			var garageService = this.Service<IGarageService>();
			var groupService = this.Service<IVehicleGroupService>();
			var brandService = this.Service<IBrandService>();

			var vehicle = vehicleService.Get(v => v.ID == id && v.Garage.OwnerID == providerID).FirstOrDefault();
			if (vehicle == null)
				return new HttpNotFoundResult();

			var viewModel = new VehicleDetailInfoViewModel(vehicle)
			{
				listGarage = garageService.Get(q => q.OwnerID == providerID && !q.IsDeleted)
					.Select(q => new SelectListItem()
					{
						Text = q.Name,
						Value = q.ID.ToString(),
						Selected = true,
					}),
				listGroup = groupService.Get(q => q.OwnerID == providerID)
					.Select(q => new SelectListItem()
					{
						Text = q.Name,
						Value = q.ID.ToString(),
						Selected = true,
					}),
				brandList = brandService.Get(
						b => b.ID != 0 // Exclude Unlisted
							&& b.VehicleModels.Count != 0 // Only get brand w/ model
					)
					.OrderBy(b => b.Name)
					.ToList()
			};

			return View("~/Areas/Provider/Views/VehicleManagement/VehicleDetail.cshtml", viewModel);
		}


		// API Route to get a list of vehicle to populate vehicleTable
		// Sort needed
		// Pagination needed
		[Route("api/vehicles", Name = "GetVehicleListAPI")]
		[HttpGet]
		public ActionResult GetVehicleListAPI(VehicleManagementFilterConditionModel filterConditions)
		{
			if (filterConditions.Draw == 0)
				return new HttpStatusCodeResult(400, "Unqualified request");
			if (filterConditions.OrderBy != null
				&& typeof(VehicleManagementItemJsonModel).GetProperty(filterConditions.OrderBy) == null)
				return new HttpStatusCodeResult(400, "Invalid sorting property");

			filterConditions.ProviderID = User.Identity.GetUserId();

			var service = this.Service<IVehicleService>();
			var vehicles = service.FilterVehicle(filterConditions);

			return Json(vehicles, JsonRequestBehavior.AllowGet);
		}


		// API Route for getting vehicle's detailed infomations (for example, to duplicate vehicle)
		[Route("api/vehicles/{id}")]
		[HttpGet]
		public JsonResult GetVehicleDetailAPI(int id)
		{
			var service = this.Service<IVehicleService>();
			Vehicle vehicle = service.Get(id);

			return Json(new
			{
				Name = vehicle.Name,
				ModelID = vehicle.ModelID,
				Year = vehicle.Year,
				GarageID = vehicle.GarageID,
				VehicleGroupID = vehicle.VehicleGroupID,
				TransmissionType = vehicle.TransmissionType,
				TransmissionDetail = vehicle.TransmissionDetail,
				FuelType = vehicle.FuelType,
				Engine = vehicle.Engine,
				Color = vehicle.Color,
				Description = vehicle.Description
			}, JsonRequestBehavior.AllowGet);
		}


		// API Route to create single new vehicles
		[Route("api/vehicles")]
		[HttpPost]
		public async Task<ActionResult> CreateVehicleAPI(CreateVehicleModel newVehicle)
		{
			var modelService = this.Service<IModelService>();
			var userId = this.User.Identity.GetUserId();
			var currentUser = this.Service<IUserService>().Get(userId);

			var errorMessage = ValidateVehicleCreating(newVehicle, currentUser, modelService);
			if (errorMessage != null)
			{
				Response.StatusCode = 400;
				return Json(new {message = errorMessage});
			}

			var newVehicleEntity = this.Mapper.Map<Vehicle>(newVehicle);

			if (Request.Files.Count < 4 || Request.Files.Count > 10)
			{
				Response.StatusCode = 400;
				return Json(new { message = "Chỉ được phép upload từ 4 đến 10 hình." });
			}

			// Upload images to cloudinary
			var cloudinary = new CloudinaryDotNet.Cloudinary(Models.Constants.CLOUDINARY_ACC);
			var imageList = new List<VehicleImage>();
			try
			{
				foreach (string fileName in Request.Files)
				{
					var file = Request.Files[fileName];
					if (file?.ContentLength <= 0) continue;

					// Upload to cloud
					var uploadResult = cloudinary.Upload(new ImageUploadParams()
					{
						File = new FileDescription(file.FileName, file.InputStream)
					});

					// Get the image's id and url
					imageList.Add(new VehicleImage() { ID = uploadResult.PublicId, URL = uploadResult.Uri.ToString() });
				}
			}
			catch (Exception ex)
			{
				Response.StatusCode = 500;
				return Json(new { message = "Upload ảnh thất bại. Vui lòng thử lại sau." });
			}

			var vehicleService = this.Service<IVehicleService>();
			await vehicleService.CreateAsync(newVehicleEntity);

			foreach (var image in imageList)
			{
				image.VehicleID = newVehicleEntity.ID;
				image.Vehicle = newVehicleEntity;
			}

			newVehicleEntity.VehicleImages = imageList;
			await vehicleService.UpdateAsync(newVehicleEntity);

			Response.StatusCode = 200;
			return Json(new { message = "Tạo xe thành công." });
		}


		// API Route to edit single vehicle
		[Route("api/vehicles/{id:int}")]
		[HttpPatch]
		public async Task<ActionResult> EditVehicleAPI(int id, EditVehicleModel updateModel)
		{
			var userId = this.User.Identity.GetUserId();
			var currentUser = this.Service<IUserService>().Get(userId);

			var errorMessage = ValidateVehicleEditing(updateModel, currentUser);
			if (errorMessage != null)
			{
				return Json(new { message = errorMessage });
			}

			var vehicleService = this.Service<IVehicleService>();

			var currentUserID = User.Identity.GetUserId();
			var vehicleEntity = vehicleService.Get(v => v.ID == id && v.Garage.OwnerID == currentUserID).FirstOrDefault();

			if(vehicleEntity == null)
				return new HttpStatusCodeResult(404, "Không tìm thấy xe.");

			Mapper.Map<EditVehicleModel, Vehicle>(updateModel, vehicleEntity);
			await vehicleService.UpdateAsync(vehicleEntity);

			return new HttpStatusCodeResult(200, "Updated successfully.");
		}


		// API Route to delete single vehicle
		[Route("api/vehicles/{id:int}")]
		[HttpDelete]
		public async Task<ActionResult> DeleteVehiclesAPI(int id)
		{
			var currentUserID = User.Identity.GetUserId();

			var service = this.Service<IVehicleService>();
			var entity = service.Get(v => v.ID == id && v.Garage.OwnerID == currentUserID).FirstOrDefault();
			if (entity == null)
				return new HttpStatusCodeResult(404, "Không tìm thấy xe.");

			// Remove all vehicle's images
			var vehicleImageService = this.Service<IVehicleImageService>();
			var vehicleImageEntities = vehicleImageService.Get(q => q.VehicleID == id);
			if (vehicleImageEntities.Any())
			{
				foreach (var item in vehicleImageEntities)
				{
					vehicleImageService.DeleteAsync(item);
				}
			}

			entity.IsDeleted = true;

			await service.UpdateAsync(entity);
			return new HttpStatusCodeResult(200, "Deleted successfully.");
		}


		// API Route to change garage of multiple vehicles
		[Route("api/vehicles/changeGarage/{garageID:int}")]
		[HttpPatch]
		public ActionResult ChangeGarageAPI(int garageID, List<int> listVehicleId)
		{
			var service = this.Service<IVehicleService>();
			List<Vehicle> lstVehicle = service.Get().ToList();
			List<Vehicle> listVehicleNeedChange = new List<Vehicle>();

			foreach (var item in listVehicleId)
			{
				Vehicle v = lstVehicle.FirstOrDefault(a => a.ID == item);
				v.GarageID = garageID;
				service.Update(v);
			}

			return new HttpStatusCodeResult(200, "Garage changed successfully.");
		}


		// API Route to change group of multiple vehicles
		[Route("api/vehicles/changeGroup/{groupID:int}")]
		[HttpPatch]
		public ActionResult ChangeGroupAPI(int groupID, List<int> listVehicleId)
		{
			var service = this.Service<IVehicleService>();
			List<Vehicle> lstVehicle = service.Get().ToList();
			List<Vehicle> listVehicleNeedChange = new List<Vehicle>();
			foreach (var item in listVehicleId)
			{
				Vehicle v = lstVehicle.FirstOrDefault(a => a.ID == item);
				v.VehicleGroupID = groupID;
				service.Update(v);
			}
			return new HttpStatusCodeResult(200, "Group changed successfully.");
		}


		// API route for getting booking receipts of a vehicle
		// Pagination needed
		// Order by booking's startTime, newer to older
		[Route("api/vehicles/bookings/{vehiceID:int}/{page:int?}")]
		[HttpGet]
		public JsonResult GetVehicleBookingAPI(int vehiceID, int page = 1)
		{
			var service = this.Service<IBookingReceiptService>();
			List<BookingReceipt> br = service.Get(q => q.VehicleID == vehiceID).ToList();
			br.Sort((x, y) => DateTime.Compare(x.StartTime, y.StartTime));
			return Json(br, JsonRequestBehavior.AllowGet);
		}


		// API route for creating an own booking
		[Route("api/vehicles/bookings")]
		[HttpPost]
		public async Task<ActionResult> CreateOwnBookingAPI(DateTime startTime, DateTime endTime, int vehicleID)
		{
			var bookingService = this.Service<IBookingReceiptService>();
			var vehicleService = this.Service<IVehicleService>();

			var currentUserID = User.Identity.GetUserId();

			var vehicle = vehicleService.Get(v => v.ID == vehicleID && v.Garage.OwnerID == currentUserID).FirstOrDefault();

			// Check if vehicle exists
			if (vehicle == null)
				return new HttpStatusCodeResult(400, "Not found.");

			// Check if startTime is after now
			if (startTime < DateTime.Now)
				return Json(new {
					isSuccess = false,
					errorMessage = "Thời gian bắt đầu phải nằm sau thời gian hiện tại."
				}, JsonRequestBehavior.AllowGet);

			// Check if endTime is after now
			if (endTime < startTime)
				return Json(new {
					isSuccess = false,
					errorMessage = "Thời gian kết thúc phải nằm sau thời gian bắt đầu."
				}, JsonRequestBehavior.AllowGet);

			// Check if this vehicle has any other bookings in the timespan of this booking
			var needCheckingStartTime = startTime.AddHours(-Constants.IN_BETWEEN_BOOKING_REST_TIME_IN_HOUR);
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
					isSuccess = false,
					errorMessage = "Xe đã được đặt trong khoảng thời gian này."
				}, JsonRequestBehavior.AllowGet);

			// Checked OK. Create new booking.
			var newBooking = new BookingReceipt()
			{
				CustomerID = currentUserID,
                BookingTime = DateTime.Now,
				StartTime = startTime,
				EndTime = endTime,
				GarageID = vehicle.GarageID,
				VehicleID = vehicleID,
				RentalPrice = 0,
				Deposit = 0,
				BookingFee = 0,
				GarageName = vehicle.Garage.Name,
				GarageAddress = vehicle.Garage.Address + ", " + vehicle.Garage.Location.Name,
				GaragePhone = vehicle.Garage.Phone1,
				GarageEmail = vehicle.Garage.Email,
				LicenseNumber = vehicle.LicenseNumber,
				VehicleName = vehicle.Name,
				TransmissionDetail = vehicle.TransmissionDetail,
				Engine = vehicle.Engine,
				Color = vehicle.Color
			};

			await bookingService.CreateAsync(newBooking);

			return Json(new { isSuccess = true });
		}


		// API route for canceling an own booking
		[Route("api/vehicles/bookings/{receiptID:int}")]
		[HttpDelete]
		public async Task<ActionResult> CancelBookingAPI(int receiptID)
		{
			var currentUserID = User.Identity.GetUserId();
			var bookingService = this.Service<IBookingReceiptService>();
			var receipt = bookingService.Get(br => br.ID == receiptID
											&& br.Garage.OwnerID == currentUserID
											&& br.CustomerID == currentUserID)
										.FirstOrDefault();
			if(receipt == null)
				return new HttpStatusCodeResult(400, "Not found.");

			receipt.IsCanceled = true;
			await bookingService.UpdateAsync(receipt);

			return new HttpStatusCodeResult(200, "Deleted successfully");
		}


		[Route("api/vehicles/images/{vehicleID:int}")]
		[HttpPost]
		public ActionResult SavePictureAPI(int vehicleID)
		{
			string userID = User.Identity.GetUserId();

			var vehicleService = this.Service<IVehicleService>();
			var vehicle = vehicleService.Get(v => v.ID == vehicleID && v.Garage.OwnerID == userID).FirstOrDefault();

			if(vehicle == null)
				return new HttpStatusCodeResult(400, "Not found.");

			if (vehicle.VehicleImages.Count > 9)
			{
				return new HttpStatusCodeResult(400, "Không thể lưu trữ hơn 10 ảnh.");
			}

			// Upload images to cloudinary
			var cloudinary = new CloudinaryDotNet.Cloudinary(Constants.CLOUDINARY_ACC);
			try
			{
				var file = Request.Files[0];
				var uploadResult = cloudinary.Upload(new ImageUploadParams()
				{
					File = new FileDescription(file.FileName, file.InputStream)
				});

				// Get the image's id and url
				vehicle.VehicleImages.Add(new VehicleImage() { ID = uploadResult.PublicId, URL = uploadResult.Uri.ToString() });

				vehicleService.Update(vehicle);

				return Json(new {Id = uploadResult.PublicId, Url = uploadResult.Uri.ToString() });
			}
			catch (Exception ex)
			{
				Response.StatusCode = 500;
				return Json("Upload ảnh thất bại. Vui lòng thử lại sau.");
			}
		}


		[Route("api/vehicles/images/{imageID}")]
		[HttpDelete]
		public ActionResult DeletePictureAPI(string imageID)
		{
			var currentUserId = User.Identity.GetUserId();

			var vehicleImageService = this.Service<IVehicleImageService>();
			var image = vehicleImageService.Get(img => img.ID == imageID
															&& img.Vehicle.Garage.OwnerID == currentUserId)
												.FirstOrDefault();
			if (image == null)
				return HttpNotFound();

			// Leave at least 4 img behind for each vehicle.
			if (image.Vehicle.VehicleImages.Count == 4)
				return new HttpStatusCodeResult(400, "A vehicle must have at least 4 images.");

			vehicleImageService.Delete(image);

			return new HttpStatusCodeResult(200, "Deleted successfully");
		}


		// Check entity on create
		public string ValidateVehicleCreating(CreateVehicleModel vehicle, AspNetUser currentUser, IModelService modelService)
		{
			if (vehicle.LicenseNumber.Length > 50)
				return "Biển số xe phải dưới 50 ký tự.";

			if (vehicle.Name.Length > 100)
				return "Tên xe phải dưới 100 ký tự.'";

			if (modelService.Get().All(m => m.ID != vehicle.ModelID))
				return "Dòng xe không tồn tại.";

			if (vehicle.Year < Models.Constants.MIN_YEAR || vehicle.Year > DateTime.Now.Year)
				return "Năm sản xuất không hợp lệ";

			if (currentUser.Garages.All(g => g.ID != vehicle.GarageID))
				return "Garage không tồn tại.";

			if(vehicle.VehicleGroupID.HasValue && currentUser.VehicleGroups.All(g => g.ID != vehicle.VehicleGroupID))
				return "Nhóm xe không tồn tại.";

			if(!Models.Constants.TRANSMISSION_TYPE.ContainsKey(vehicle.TransmissionType))
				return "Loại hộp số không hợp lệ.";

			if (vehicle.FuelType.HasValue && !Models.Constants.FUEL_TYPE.ContainsKey(vehicle.FuelType.Value))
				return "Loại nhiên liệu không hợp lệ";

			if (vehicle.TransmissionDetail != null && vehicle.TransmissionDetail.Length > 100)
				return "Chi tiết hộp số phải dưới 100 ký tự.";

			if (vehicle.Engine != null && vehicle.Engine.Length > 100)
				return "Chi tiết động cơ phải dưới 100 ký tự.";

			if (vehicle.Description != null && vehicle.Description.Length > 1000)
				return "Mô tả xe phải dưới 1000 ký tự.";

			if (!Models.Constants.COLOR.ContainsKey(vehicle.Color))
				return "Mã màu không hợp lệ.";

			return null;
		}

		// Check entity on editing
		public string ValidateVehicleEditing(EditVehicleModel vehicle, AspNetUser currentUser)
		{
			if (vehicle.LicenseNumber.Length > 50)
				return "Biển số xe phải dưới 50 ký tự.";

			if (vehicle.Name.Length > 100)
				return "Tên xe phải dưới 100 ký tự.";

			if (currentUser.Garages.All(g => g.ID != vehicle.GarageID))
				return "Garage không tồn tại.";

			if (vehicle.VehicleGroupID.HasValue && currentUser.VehicleGroups.All(g => g.ID != vehicle.VehicleGroupID))
				return "Nhóm xe không tồn tại.";

			if (vehicle.TransmissionDetail != null && vehicle.TransmissionDetail.Length > 100)
				return "Chi tiết hộp số phải dưới 100 ký tự.";

			if (vehicle.Engine != null && vehicle.Engine.Length > 100)
				return "Chi tiết động cơ phải dưới 100 ký tự.";

			if (vehicle.Description != null && vehicle.Description.Length > 1000)
				return "Mô tả xe phải dưới 1000 ký tự.";

			if (!Models.Constants.COLOR.ContainsKey(vehicle.Color))
				return "Mã màu không hợp lệ.";

			return null;
		}
		
	}
}