namespace BCP.Upload.Data
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;
    using System.Linq;

    [Table("Share")]
    public class Share
    {
        public int ShareId { get; set; }

        /// <summary>
        /// User Id 
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// UserName
        /// </summary>
        public string UserName { get; set; }

        /// <summary>
        /// Name of the file server
        /// </summary>
        public string ShareName { get; set; }

        /// <summary>
        /// Total space in File Server (GB) 
        /// </summary>
        public int TotalSpace { get; set; }

        /// <summary>
        /// Total Free Space available in file server (GB)
        /// </summary>
        public int FreeSpace { get; set; }

        /// <summary>
        /// Network fileshare path.
        /// </summary>
        public string NetworkSharePath { get; set; }
    }
}
