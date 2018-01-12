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
    
    public partial class VehicleGroup
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public VehicleGroup()
        {
            this.Vehicles = new HashSet<Vehicle>();
        }
    
        public int ID { get; set; }
        public string OwnerID { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public int WithDriverPriceGroupID { get; set; }
    
        public virtual AspNetUser AspNetUser { get; set; }
        public virtual PriceGroup PriceGroup { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Vehicle> Vehicles { get; set; }
    }
}