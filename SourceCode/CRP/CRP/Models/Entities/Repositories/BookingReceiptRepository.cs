using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRP.Models.Entities.Repositories
{
	public interface IBookingReceiptRepository : IRepository<BookingReceipt>
    {
    }
    public class BookingReceiptRepository : BaseRepository<BookingReceipt>, IBookingReceiptRepository
    {
        public BookingReceiptRepository(CRPEntities dbContext) : base(dbContext)
        {
        }
    }
}