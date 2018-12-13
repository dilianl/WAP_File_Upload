namespace BCP.Upload.Data
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;
    using System.Linq;

    [Table("UploadRecord")]
    public partial class UploadRecord
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]

        public int Id { get; set; }

        public string Name { get; set; }

        public string FileCloudName { get; set; }

        public int CloudId { get; set; }
        
        public string Container { get; set; }

        public int ShareId { get; set; }

        public string Extension { get; set; }

        public string MimeType { get; set; }

        public string Description { get; set; }

        public long Size { get; set; }
        
        public bool IsShared { get; set; }

        public bool IsHidden { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime ExpiredDate { get; set; }

    }
}
