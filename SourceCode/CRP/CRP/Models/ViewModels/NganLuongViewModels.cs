using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.ViewModels
{
	// Input model to construct NganLuong api call
	public class NganLuongPaymentModel
	{
		public string PaymentMethod { get; set; }
		public string BankCode { get; set; }
		public string OrderCode { get; set; }
	}
}