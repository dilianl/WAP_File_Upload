using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace BCP.Upload.ApiClient.DataContracts
{
    public class StorageFile
    {
        /// <summary>
        /// Name of the file.
        /// </summary>
        [DataMember(Order = 1)]
        public string StorageFileName { get; set; }

        /// <summary>
        /// Size of file. (Bytes)
        /// </summary>
        [DataMember(Order = 2)]
        public long TotalSize { get; set; }

        /// <summary>
        /// UserId
        /// </summary>
        [DataMember(Order = 3)]
        public int ShareId { get; set; }

        /// <summary>
        /// File Content
        /// </summary>
        //[DataMember(Order = 3)]
        //public byte[] FileContent { get; set; }
    }
}
