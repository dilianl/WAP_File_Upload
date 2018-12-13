// ---------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------

using System.Collections.Generic;
using System.Runtime.Serialization;

namespace BCP.Upload.Common
{
    /// <summary>
    /// This is a data contract class between extensions and resource provider
    /// </summary>
    [DataContract(Namespace = Constants.DataContractNamespaces.Default)]
    public class Subscription : IExtensibleDataObject
    {
        /// <summary>
        /// Gets or sets the subscription id.
        /// </summary>
        [DataMember(Order = 1)]
        public string SubscriptionId { get; set; }

        /// <summary>
        /// Gets or sets the subscription admin id.
        /// </summary>
        [DataMember(Order = 2)]
        public string AdminId { get; set; }

        /// <summary>
        /// Gets or sets the name of the subscription.
        /// </summary>
        [DataMember(Order = 3)]
        public string SubscriptionName { get; set; }

        /// <summary>
        /// Gets the co admin ids.
        /// </summary>
        [DataMember(Order = 4)]
        public string CoAdminIds { get; set; }

        /// <summary>
        /// Gets or sets the state.
        /// </summary>
        [DataMember(Order = 5)]
        public SubscriptionState State { get; set; }

        /// <summary>
        /// Gets or sets the state of the lifecycle (Only required if Resource Provider opt to implement async protocols).
        /// </summary>
        [DataMember(Order = 6)]
        public SubscriptionLifecycleState LifecycleState { get; set; }

        /// <summary>
        /// Gets or sets the last error message (Only required if Resource Provider opt to implement async protocols).
        /// </summary>
        [DataMember(Order = 7)]
        public string LastErrorMessage { get; set; }

        /// <summary>
        /// Gets or sets the quota settings.
        /// </summary>
        [DataMember(Order = 8)]
        public IList<ServiceQuotaSetting> QuotaSettings { get; set; }

        /// <summary>
        /// Gets or sets the extension data.
        /// </summary>
        public ExtensionDataObject ExtensionData { get; set; }
    }
}
