using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CRP.Models
{
	public class ExternalLoginConfirmationViewModel
	{
		[Required]
		[Display(Name = "Email")]
		public string Email { get; set; }
	}

	public class ExternalLoginListViewModel
	{
		public string ReturnUrl { get; set; }
	}

	public class SendCodeViewModel
	{
		public string SelectedProvider { get; set; }
		public ICollection<System.Web.Mvc.SelectListItem> Providers { get; set; }
		public string ReturnUrl { get; set; }
		public bool RememberMe { get; set; }
	}

	public class VerifyCodeViewModel
	{
		[Required]
		public string Provider { get; set; }

		[Required]
		[Display(Name = "Code")]
		public string Code { get; set; }
		public string ReturnUrl { get; set; }

		[Display(Name = "Remember this browser?")]
		public bool RememberBrowser { get; set; }

		public bool RememberMe { get; set; }
	}

	public class ForgotViewModel
	{
		[Required]
		[Display(Name = "Email")]
		public string Email { get; set; }
	}

	public class LoginViewModel
	{
		[Required(ErrorMessage = "Email không được để trống", AllowEmptyStrings = false)]
		[Display(Name = "Email")]
		[EmailAddress(ErrorMessage = "Không đúng định dạng email.")]
		public string Email { get; set; }

		[Required(ErrorMessage = "Password không được để trống", AllowEmptyStrings = false)]
		[DataType(DataType.Password)]
		[Display(Name = "Password")]
		public string Password { get; set; }

		[Display(Name = "Remember me?")]
		public bool RememberMe { get; set; }
	}

	public class RegisterViewModel
	{
		[Required(ErrorMessage = "Username không được để trống", AllowEmptyStrings = false)]
		[StringLength(20, ErrorMessage = "Username chỉ được dài tối đa 20 kí tự.")]
		[RegularExpression(@"^\S*$", ErrorMessage = "Tên đăng nhập không được có khoảng trắng.")]
		[Display(Name = "Username")]
		public string Username { get; set; }

		
		[Display(Name = "Tên đầy đủ")]
		[Required(ErrorMessage = "Tên đầy đủ không được để trống", AllowEmptyStrings = false)]
		[StringLength(200, ErrorMessage = "Tên đầy đủ không vượt quá 200 kí tự.")]
		public string Fullname { get; set; }

		[Required(ErrorMessage = "Email không được để trống", AllowEmptyStrings = false)]
		[EmailAddress(ErrorMessage = "Không đúng định dạng email.")]
		[Display(Name = "Email")]
		public string Email { get; set; }

		[EmailAddress(ErrorMessage = "Không đúng định dạng email.")]
		[Display(Name = "Xác nhận email")]
		[Compare("Email", ErrorMessage = "Email không trùng khớp.")]
		public string ConfirmEmail { get; set; }

		[Required(ErrorMessage = "Mật khẩu không được để trống", AllowEmptyStrings = false)]
		[StringLength(100, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự.", MinimumLength = 6)]
		[DataType(DataType.Password, ErrorMessage = "Mật khẩu phải có ít nhất 1 ký tự hoa, ký tự thường và số.")]
		[Display(Name = "Mật khẩu")]
		public string Password { get; set; }

		[DataType(DataType.Password)]
		[Display(Name = "Xác nhận mật khẩu")]
		[Compare("Password", ErrorMessage = "Mật khẩu không khớp")]
		public string ConfirmPassword { get; set; }

		[Required(ErrorMessage = "Số điện thoại không được để trống", AllowEmptyStrings = false)]
		[RegularExpression(@"^[0-9-+]+$", ErrorMessage = "Chỉ chấp nhận số, '-' và '+'.")]
		[StringLength(20, ErrorMessage = "Số điện thoại phải có độ dài từ 10 đến 20 ký tự.", MinimumLength = 10)]
		[Display(Name = "Số điện thoại")]
		public string PhoneNumber { get; set; }
	}

	public class createNewGarageViewModel
	{
		[Required]
		[Display(Name = "Garage Name")]
		public string GarageName { get; set; }

		[Required]
		[Display(Name = "Location")]
		public string LocationID { get; set; }

		[Required]
		[Display(Name = "Address")]
		public string Address { get; set; }

		[Required]
		[EmailAddress(ErrorMessage = "Không đúng định dạng email.")]
		[Display(Name = "Email")]
		public string Email { get; set; }

		[Required]
		[StringLength(50, ErrorMessage = "The {0} must be at least {2} characters.", MinimumLength = 2)]
		[DataType(DataType.PhoneNumber)]
		[Display(Name = "PhoneNumber")] 
		public string PhoneNumber { get; set; }
	}


	public class ResetPasswordViewModel
	{
		[Required]
		public string UserId { get; set; }
		[Required]
		public string Token { get; set; }

		[Required(ErrorMessage = "Mật khẩu mới không được để trống", AllowEmptyStrings = false)]
		[StringLength(100, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự.", MinimumLength = 6)]
		[DataType(DataType.Password, ErrorMessage = "Mật khẩu phải có ít nhất 1 ký tự hoa, ký tự thường và số.")]
		[Display(Name = "Mật khẩu")]
		public string Password { get; set; }

		[DataType(DataType.Password)]
		[Display(Name = "Xác nhận mật khẩu")]
		[Compare("Password", ErrorMessage = "Mật khẩu không khớp.")]
		public string ConfirmPassword { get; set; }
	}

	public class ForgotPasswordViewModel
	{
		[Required(ErrorMessage = "Email không được để trống", AllowEmptyStrings = false)]
		[EmailAddress(ErrorMessage = "Không đúng định dạng email.")]
		[Display(Name = "Email")]
		public string Email { get; set; }
	}
}
