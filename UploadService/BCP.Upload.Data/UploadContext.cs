namespace BCP.Upload.Data
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class UploadContext : DbContext
    {
        public UploadContext()
            : base("name=UploadContext")
        {
        }
        
        public virtual DbSet<UploadRecord> UploadRecords { get; set; }

        public virtual DbSet<Share> Shares { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
           
        }
    }
}
