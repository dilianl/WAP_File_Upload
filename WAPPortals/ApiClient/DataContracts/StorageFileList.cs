

using System.Collections.Generic;
using System.Runtime.Serialization;

namespace BCP.Upload.ApiClient.DataContracts
{
    [CollectionDataContract(Name = "StorageFiles", ItemName = "StorageFile", Namespace = Constants.DataContractNamespaces.Default)]
    public class StorageFileList : List<StorageFile>, IExtensibleDataObject
    {
        /// <summary>
        /// Gets or sets the structure that contains extra data.
        /// </summary>
        public ExtensionDataObject ExtensionData { get; set; }
    }
}
