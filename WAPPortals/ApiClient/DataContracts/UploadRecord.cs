using BCP.Upload.Data;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace BCP.Upload.ApiClient.DataContracts
{
    /// <summary>
    /// 
    /// </summary>
    [DataContract(Namespace = Constants.DataContractNamespaces.Default)]
    public class UploadRecord
    {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public string FileCloudName { get; set; }

        [DataMember]
        public int CloudId { get; set; }

        [DataMember]
        public string Container { get; set; }

        [DataMember]
        public string Extension { get; set; }

        [DataMember]
        public string MimeType { get; set; }

        [DataMember]
        public string Description { get; set; }

        [DataMember]
        public int Size { get; set; }

        [DataMember]
        public int UserId { get; set; }

        [DataMember]
        public bool IsShared { get; set; }

        [DataMember]
        public bool IsHidden { get; set; }

        [DataMember]
        public DateTime CreatedDate { get; set; }

        [DataMember]
        public DateTime ExpiredDate { get; set; }

    }
}
