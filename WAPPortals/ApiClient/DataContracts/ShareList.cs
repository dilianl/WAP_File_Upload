
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace BCP.Upload.ApiClient.DataContracts
{    
    [CollectionDataContract(Name = "Shares", ItemName = "Share", Namespace = Constants.DataContractNamespaces.Default)]
    public class ShareList : List<Share>, IExtensibleDataObject
    {
        /// <summary>
        /// Gets or sets the structure that contains extra data.
        /// </summary>
        public ExtensionDataObject ExtensionData { get; set; }
    }
}
