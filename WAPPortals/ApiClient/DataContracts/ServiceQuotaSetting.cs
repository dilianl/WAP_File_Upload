﻿// ---------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------
using System.Runtime.Serialization;

namespace BCP.Upload.ApiClient.DataContracts
{
    /// <summary>
    /// Represent a service quota setting.
    /// </summary>
    [DataContract(Namespace = Constants.DataContractNamespaces.Default)]
    public class ServiceQuotaSetting : IExtensibleDataObject
    {
        /// <summary>
        /// Gets or sets the setting key.
        /// </summary>
        [DataMember(Order = 0, IsRequired = true)]
        public string Key { get; set; }

        /// <summary>
        /// Gets or sets the setting value.
        /// </summary>
        [DataMember(Order = 1, IsRequired = true)]
        public string Value { get; set; }

        /// <summary>
        /// Gets or sets the structure that contains extra data.
        /// </summary>
        public ExtensionDataObject ExtensionData { get; set; }
    }
}
