//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace CRP.Models.Entities
{
    using System;
    using System.Collections.Generic;
    
    public partial class Garage
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Garage()
        {
            this.BookingReceipts = new HashSet<BookingReceipt>();
            this.Vehicles = new HashSet<Vehicle>();
            this.GarageWorkingTimes = new HashSet<GarageWorkingTime>();
        }
    
        public int ID { get; set; }
        public string OwnerID { get; set; }
        public string Name { get; set; }
        public int LocationID { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public string Phone1 { get; set; }
        public string Phone2 { get; set; }
        public int NumOfComment { get; set; }
        public decimal Star { get; set; }
        public string Description { get; set; }
        public string Policy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    
        public virtual AspNetUser AspNetUser { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BookingReceipt> BookingReceipts { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Vehicle> Vehicles { get; set; }
        public virtual Location Location { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<GarageWorkingTime> GarageWorkingTimes { get; set; }
    }
}