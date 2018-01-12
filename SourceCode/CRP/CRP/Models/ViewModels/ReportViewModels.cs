using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CRP.Models.Entities;
using System.Text.RegularExpressions;

namespace CRP.Models.ViewModels
{
	public class AdminReportViewModel
	{
		public int NumOfActiveUser { get; set; }
		public int NumOfActiveProvider { get; set; }
		public int NumOfActiveGarage { get; set; }
		public int NumOfActiveVehicle { get; set; }
		public int ThisMonthNumOfSuccessfulBooking { get; set; }
        public double ThisMonthNumOfProfit { get; set; } = 0.0;
		public List<MonthlyAdminSaleReport> LastHalfYearSaleReportList { get; set; } = new List<MonthlyAdminSaleReport>();

		public class MonthlyAdminSaleReport
		{
			public DateTime Time { get; set; }
			public int NumOfSuccessfulBooking { get; set; }
            public double Profit { get; set; }
		}

		public void AddMonthlyReport(List<BookingReceipt> bookingReceipts, DateTime time)
		{
			var report = new AdminReportViewModel.MonthlyAdminSaleReport
			{
				Time = time,
				NumOfSuccessfulBooking = bookingReceipts.Count(),
				Profit = bookingReceipts.Any() ? bookingReceipts.Sum(r => r.BookingFee) : 0.0
			};

			LastHalfYearSaleReportList.Add(report);
		}
	}

    public class ProviderReportViewModel
    {
        public int NumOfGarage { get; set; }
        public int NumOfVehicle { get; set; }
        public int NumOfBookingSuccessfulInThisMonth { get; set; }
        public int NumOfBookingInThisMonth { get; set; }
        public double Profit { get; set; } = 0.0;
        public DateTime? ProviderUtil { get; set; }
        public List<CommentModel> Comment { get; set; } = new List<CommentModel>();
        public List<MonthlySaleReport> ReportData { get; set; } = new List<MonthlySaleReport>();

        public class CommentModel
        {
            public int? VehicleID { get; set; }
            public string VehicleName { get; set; }
            public string UserName { get; set; }
            public string UserAvatarUrl { get; set; }
            public int? Star { get; set; }
        }

        public class MonthlySaleReport
        {
            public DateTime Time { get; set; }
            public int NumOfSuccessBooking { get; set; }
            public int NumOfBooking { get; set; }
            public double Profit { get; set; }
        }

        public void GetCommentData(BookingReceipt booking)
        {
            if (booking.Comment != null || booking.Star != null)
            {
                var data = new CommentModel
                {
                    VehicleID = booking.VehicleID,
                    VehicleName = booking.VehicleName,
                    UserName = booking.AspNetUser.UserName,
					UserAvatarUrl = booking.AspNetUser.AvatarURL,
					Star = booking.Star
                };
                Comment.Add(data);
            }
        }

        public void GetDataForReport(List<BookingReceipt> bookings, DateTime time)
        {
            var month = new MonthlySaleReport
            {
                Time = time,
                NumOfSuccessBooking = bookings.Count(b => !b.IsCanceled),
                NumOfBooking = bookings.Count(),
                Profit = (bookings.Any(b => !b.IsCanceled)
                    ? bookings.Sum(r => r.RentalPrice) : 0.0)
                    + (bookings.Any(b => b.IsCanceled)
                    ? bookings.Sum(r => r.Deposit) : 0.0)
            };
            ReportData.Add(month);
        }
    }

    public class UserViewModel
    {
        public string ID { get; set; }
        public String UserName { get; set; }
        public String Email { get; set; }
        public string phoneNumber { get; set; }
        public String role { get; set; }
        public String providerUtil { get; set; }
        public Boolean status { get; set; }
    }
}