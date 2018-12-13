using System.Runtime.Serialization;

namespace BCP.Upload.ApiClient.DataContracts
{
    /// <summary>
    /// This is a data contract class between extensions and resource provider
    /// Share contains data contract of data which shows up in "Shares" tab inside Storage Admin Extension
    /// </summary>
    [DataContract(Namespace = Constants.DataContractNamespaces.Default)]
    public class ResetPassword
    {
        
        /// <summary>
        /// UserId
        /// </summary>
        [DataMember(Order = 1)]
        public string UserName { get; set; }

        /// <summary>
        /// User Name
        /// </summary>
        [DataMember(Order = 2)]
        public string NewPassword { get; set; }
    }
}
