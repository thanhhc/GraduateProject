using CRP.Models.Entities.Repositories;
using CRP.Models.JsonModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using CRP.Models.ViewModels;

namespace CRP.Models.Entities.Services
{
	public interface IBookingReceiptService : IService<BookingReceipt>
	{
		BookingHistoryDataTablesModel GetBookingHistory(string customerID, int page, int recordPerPage, int draw);
		BookingsDataTablesJsonModel FilterBookings(BookingsFilterConditions conditions);
	}
	public class BookingReceiptService : BaseService<BookingReceipt>, IBookingReceiptService
	{
		public BookingReceiptService(IUnitOfWork unitOfWork, IBookingReceiptRepository repository) : base(unitOfWork, repository)
		{

		}

		public BookingReceiptService()
		{
		}

		// Get the booking history of a customer
		public BookingHistoryDataTablesModel GetBookingHistory(string customerID, int page, int recordPerPage, int draw)
		{
			var receiptList = repository.Get(br => br.CustomerID == customerID
												&& br.CustomerID != br.Garage.OwnerID // Not self-booking
												&& !br.IsPending // Not pending
												);

			var total = receiptList.Count();

			// Sort + paginate
			receiptList = receiptList
				.OrderByDescending(q => q.StartTime)
				.Skip((page - 1) * recordPerPage)
				.Take(recordPerPage);

			return new BookingHistoryDataTablesModel(receiptList.ToList(), draw, total);
		}

		public BookingsDataTablesJsonModel FilterBookings(BookingsFilterConditions conditions)
		{
			// Get all available booking receipt
			var bookings = repository.Get(b => b.Garage.OwnerID == conditions.providerID
				&& b.IsPending == false);

			if (conditions.vehicleID != null)
			{
				bookings = bookings.Where(b => b.VehicleID == conditions.vehicleID);
			}

			if (conditions.garageID != null)
			{
				bookings = bookings.Where(b => b.GarageID == conditions.garageID);
			}

			// Exclude canceled receipt while IsCanceled is not checked
			if(!conditions.IsCanceled)
			{
				bookings = bookings.Where(b => b.IsCanceled == false);
			}

			// Exclude canceled receipt while IsSelfBooking is not checked
			if (!conditions.IsSelfBooking)
			{
				bookings = bookings.Where(b => b.CustomerID != b.Garage.OwnerID);
			}

			if(conditions.IsInThePast != null)
			{
				DateTime now = DateTime.Now;
				// while only IsInThePast is checked
				if(conditions.IsInThePast == true)
				{
					bookings = bookings.Where(b => b.StartTime < now);
				}
				// while only IsInFuture is checked
				else
				{
					bookings = bookings.Where(b => b.StartTime >= now);
				}
			}

			var recordsTotal = bookings.Count();

			// Search, if Search param exists
			if (conditions.Search != null)
				bookings = bookings.Where(b => b.AspNetUser.FullName.Contains(conditions.Search)
							|| b.VehicleName.Contains(conditions.Search) || b.LicenseNumber.Contains(conditions.Search));

			var result = bookings.ToList().Select(b => new BookingsRecordJsonModel(b));

			// Sort
			// Default sort
			if(conditions.OrderBy == null || nameof(BookingsRecordJsonModel.ID) == conditions.OrderBy)
			{
				result = result.OrderBy(r => r.CustomerName);
			}
			else
			{
				if(nameof(BookingsRecordJsonModel.CustomerName) == conditions.OrderBy)
				{
					result = conditions.IsDescendingOrder ? result.OrderByDescending(r => r.CustomerName)
						: result.OrderBy(r => r.CustomerName);
				}
				else
				{
					var sortingProp = typeof(BookingsRecordJsonModel).GetProperty(conditions.OrderBy);
					result = conditions.IsDescendingOrder
						? result.OrderByDescending(r => sortingProp.GetValue(r))
						: result.OrderBy(r => sortingProp.GetValue(r));
				}
			}

			// Paginate
			var filteredRecords = result.Count();
			if ((conditions.Page - 1) * conditions.RecordPerPage > filteredRecords)
			{
				conditions.Page = 1;
			}

			result = result.Skip((conditions.Page - 1) * conditions.RecordPerPage)
					.Take(conditions.RecordPerPage);

			return new BookingsDataTablesJsonModel(result.ToList(), conditions.Draw, recordsTotal, filteredRecords);
		}

	}
}