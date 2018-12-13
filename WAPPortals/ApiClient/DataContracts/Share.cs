
using System.Runtime.Serialization;

namespace BCP.Upload.ApiClient.DataContracts
{
    /// <summary>
    /// This is a data contract class between extensions and resource provider
    /// Share contains data contract of data which shows up in "Shares" tab inside Storage Admin Extension
    /// </summary>
    [DataContract(Namespace = Constants.DataContractNamespaces.Default)]
    public class Share
    {
        [DataMember(Order = 1)]
        public int ShareId { get; set; }

        /// <summary>
        /// Name of the file server
        /// </summary>
        [DataMember(Order = 2)]
        public string ShareName { get; set; }

        /// <summary>
        /// Total space in File Server (MB) 
        /// </summary>
        [DataMember(Order = 3)]
        public int TotalSpace { get; set; }

        /// <summary>
        /// Total Free Space available in file server (MB)
        /// </summary>
        [DataMember(Order = 4)]
        public int FreeSpace { get; set; }

        /// <summary>
        /// Network fileshare path.
        /// </summary>
        [DataMember(Order = 5)]
        public string NetworkSharePath { get; set; }

        /// <summary>
        /// UserId
        /// </summary>
        [DataMember(Order = 6)]
        public int UserId { get; set; }

        /// <summary>
        /// User Name
        /// </summary>
        [DataMember(Order = 7)]
        public string UserName { get; set; }
    }
}
