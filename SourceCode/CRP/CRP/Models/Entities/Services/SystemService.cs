using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Mail;
using System.Threading.Tasks;
using CRP.Controllers;

namespace CRP.Models.Entities.Services
{
	public class SystemService : BaseController
	{
		//gui mail thong bao ve Booking moi
		public async Task SendBookingAlertEmailToCustomer(BookingReceipt booking)
		{
			var mailMessage = new MailMessage("crpservices2@gmail.com", booking.AspNetUser.Email)
			{
				Subject = "Giao dịch đặt xe mới trên hệ thống CRP",
				Body = "Bạn vừa tiến hành đặt xe " + booking.VehicleName + " thành công trên hệ thống của chúng tôi.\nChúc bạn có một chuyến đi vui vẻ."
			};

			await SendEmail(mailMessage);
		}

		//gui mail thong bao ve Booking moi
		public async Task SendBookingAlertEmailToProvider(BookingReceipt booking)
		{
			var mailMessage = new MailMessage("crpservices2@gmail.com", booking.Garage.Email)
			{
				Subject = "Giao dịch đặt xe mới trên hệ thống CRP",
				Body = "Xe " + booking.VehicleName + " của bạn vừa được đặt từ " + booking.StartTime.ToString(@"dd\/MM\/yyyy HH:mm") + " đến " + booking.EndTime.ToString(@"dd\/MM\/yyyy HH:mm") + " bởi khách hàng " + booking.AspNetUser.FullName + ".\n"
					+ "Bạn có thể liên hệ với khách hàng qua email <a href=\"mailto:" + booking.AspNetUser.Email + "\">" + booking.AspNetUser.Email + "</a> hoặc qua số điện thoại <a href=\"tel:" + booking.AspNetUser.PhoneNumber + "\">" + booking.AspNetUser.PhoneNumber + "</a>."
			};

			await SendEmail(mailMessage);
		}

		// Mail on canceling booking to customer
		public async Task SendBookingCanceledAlertEmailToCustomer(BookingReceipt booking)
		{
			var mailMessage = new MailMessage("crpservices2@gmail.com", booking.AspNetUser.Email)
			{
				Subject = "Hủy đặt xe trên hệ thống CRP",
				Body = "Bạn vừa tiến hành hủy đặt xe " + booking.VehicleName + " thành công trên hệ thống của chúng tôi.\n Xin cảm ơn."
			};

			await SendEmail(mailMessage);
		}

		// Mail on canceling booking to provider
		public async Task SendBookingCanceledAlertEmailToProvider(BookingReceipt booking)
		{
			var mailMessage = new MailMessage("crpservices2@gmail.com", booking.Garage.Email)
			{
				Subject = "Giao dịch đặt xe mới trên hệ thống CRP",
				Body = "Lịch đặt xe từ " + booking.StartTime.ToString(@"dd\/MM\/yyyy HH:mm") + " đến " + booking.EndTime.ToString(@"dd\/MM\/yyyy HH:mm") + " bởi khách hàng " + booking.AspNetUser.FullName + " cho xe " + booking.VehicleName + " của bạn vừa được hủy."
			};

			await SendEmail(mailMessage);
		}

		//gui mail thong bao provider
		public async Task SendBecomeProviderAlertEmail(string toEmail, AspNetUser user)
		{
			var mailMessage = new MailMessage("crpservices2@gmail.com", toEmail)
			{
				Subject = "Giao dịch đăng ký quyền cung cấp trên hệ thống CRP",
				Body = "Giao dịch đăng ký quyền nhà cung cấp cho thuê xe trên hệ thống CRP của bạn đã thành công. Cảm ơn bạn đã chọn đồng hành cùng chúng tôi."
			};

			await SendEmail(mailMessage);
		}

		//gui mail khi bi admin BAN
		public async Task SendLockoutAlertEmail(AspNetUser user)
		{
			var mailMessage = new MailMessage("crpservices2@gmail.com", user.Email)
			{
				Subject = "Tài khoản CRP của bạn đã bị khóa.",
				Body = "Tài khoản CRP với username " + user.UserName + " của bạn đã bị khóa. Nếu có vấn đề thắc mắc, vui lòng liên hệ trực tiếp với chúng tôi.\nXin cảm ơn."
			};

			await SendEmail(mailMessage);
		}

		// //gui mail khi bi dang ki
		public async Task SendRegistrationConfirmEmail(string userEmail, string callbackUrl)
		{
			var mailMessage = new MailMessage("crpservices2@gmail.com", userEmail)
			{
				Subject = "Xác nhận đăng ký tài khoản CRP",
				Body = "Vui lòng xác nhận tài khoản CRP của bạn bằng cách click vào <a href=\"" + callbackUrl + "\">đây</a>."
			};

			await SendEmail(mailMessage);
		}

		//gui mail lay lai password
		public async Task SendRecoverPasswordEmail(string userEmail, string callbackUrl)
		{
			var mailMessage = new MailMessage("crpservices2@gmail.com", userEmail)
			{
				Subject = "Khôi phục mật khẩu tài khoản CRP.",
				Body = "Chúng tôi vừa nhận được yêu cầu khôi phục mật khẩu cho tài khoản đăng ký với email này. Để khôi phục mật khẩu, vui lòng click vào <a href=\"" + callbackUrl + "\">đây</a>."
			};

			await SendEmail(mailMessage);
		}

		#region support function

		private static async Task SendEmail(MailMessage message)
		{
			using (var smtpClient = new SmtpClient("smtp.gmail.com", 587)
			{
				Credentials = new System.Net.NetworkCredential()
				{
					UserName = "crpservices2@gmail.com",
					Password = "A123456z"
				},
				EnableSsl = true
			})
			{
				await smtpClient.SendMailAsync(message);
				message.Dispose();
			}
		}

		#endregion
	}
}