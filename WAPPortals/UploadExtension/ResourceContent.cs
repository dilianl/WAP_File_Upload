// ---------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------

using Microsoft.Azure.Portal.DynamicContent;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Resources;

namespace BCP.Upload.TenantExtension
{
    /// <summary>
    /// The export for the resources of this dll
    /// This is needed to get resource string available in javascript files
    /// </summary>
    [Export(typeof(IResourceManagers))]
    public class ResourceContent : IResourceManagers
    {
        /// <summary>
        /// Gets the ResourceManagers for this dll
        /// </summary>
        public IEnumerable<ResourceManager> ResourceManagers
        {
            get
            {
                // Specify name of your resources class here
                yield return UploadTenantResources.ResourceManager;
            }
        }
    }
}
