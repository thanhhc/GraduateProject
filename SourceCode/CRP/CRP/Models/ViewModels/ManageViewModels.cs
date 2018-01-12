using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;

namespace CRP.Models
{
	public class PersonalInfoViewModel
	{
		public bool HasPassword { get; set; }
		public IList<UserLoginInfo> Logins { get; set; }
		public bool TwoFactor { get; set; }
		public bool BrowserRemembered { get; set; }

		[Display(Name = "Tên đầy đủ")]
		[Required(ErrorMessage = "Tên đầy đủ không được để trống", AllowEmptyStrings = false)]
		[StringLength(200, ErrorMessage = "Tên đầy đủ không vượt quá 200 kí tự.")]
		public string Fullname { get; set; }

		[Display(Name = "Email")]
		[EmailAddress(ErrorMessage = "Không đúng định dạng email.")]
		public string Email { get; set; }
		
		[Required(ErrorMessage = "Số điện thoại không được để trống", AllowEmptyStrings = false)]
		[RegularExpression(@"^[0-9-+]+$", ErrorMessage = "Chỉ chấp nhận số, '-' và '+'.")]
		[StringLength(20, ErrorMessage = "Số điện thoại phải có độ dài từ 10 đến 20 ký tự.", MinimumLength = 10)]
		[Display(Name = "Số điện thoại")]
		public string PhoneNumber { get; set; }
		
		public string AvatarUrl { get; set; }

		public bool IsSuccess { get; set; }
		public string StatusMessage { get; set; }
	}

	public class ManageLoginsViewModel
	{
		public IList<UserLoginInfo> CurrentLogins { get; set; }
		public IList<AuthenticationDescription> OtherLogins { get; set; }
	}

	public class FactorViewModel
	{
		public string Purpose { get; set; }
	}

	public class SetPasswordViewModel
	{
		[Required(ErrorMessage = "Mật khẩu không được để trống", AllowEmptyStrings = false)]
		[StringLength(100, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự.", MinimumLength = 6)]
		[DataType(DataType.Password, ErrorMessage = "Mật khẩu phải có ít nhất 1 ký tự hoa, ký tự thường và số.")]
		[Display(Name = "Mật khẩu")]
		public string Password { get; set; }

		[DataType(DataType.Password)]
		[Display(Name = "Xác nhận mật khẩu")]
		[Compare("Password", ErrorMessage = "Mật khẩu không khớp")]
		public string ConfirmPassword { get; set; }
	}

	public class ChangePasswordViewModel
	{
		[Required(ErrorMessage = "Mật khẩu cũ không được để trống", AllowEmptyStrings = false)]
		[DataType(DataType.Password, ErrorMessage = "Mật khẩu phải có ít nhất 1 ký tự hoa, ký tự thường và số.")]
		[Display(Name = "Mật khẩu cũ")]
		public string OldPassword { get; set; }

		[Required(ErrorMessage = "Mật khẩu mới không được để trống", AllowEmptyStrings = false)]
		[StringLength(100, ErrorMessage = "Mật khẩu phải có ít nhất 6 kí tự và ít hơn 100 kí tự.", MinimumLength = 6)]
		[DataType(DataType.Password, ErrorMessage = "Mật khẩu phải có ít nhất 1 ký tự hoa, ký tự thường và số.")]
		[Display(Name = "Mật khẩu")]
		public string NewPassword { get; set; }

		[DataType(DataType.Password)]
		[Display(Name = "Xác nhận mật khẩu")]
		[Compare("NewPassword", ErrorMessage = "Mật khẩu không khớp")]
		public string ConfirmPassword { get; set; }
		
		public string StatusMessage { get; set; }
	}

	public class AddPhoneNumberViewModel
	{
		[Required]
		[Phone]
		[Display(Name = "Phone Number")]
		public string Number { get; set; }
	}

	public class VerifyPhoneNumberViewModel
	{
		[Required]
		[Display(Name = "Code")]
		public string Code { get; set; }

		[Required]
		[Phone]
		[Display(Name = "Phone Number")]
		public string PhoneNumber { get; set; }
	}

	public class ConfigureTwoFactorViewModel
	{
		public string SelectedProvider { get; set; }
		public ICollection<System.Web.Mvc.SelectListItem> Providers { get; set; }
	}
}