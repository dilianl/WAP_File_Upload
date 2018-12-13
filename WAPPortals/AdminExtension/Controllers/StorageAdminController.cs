
using Microsoft.Azure.Portal.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;
using BCP.Upload.AdminExtension.Models;
using BCP.Upload.WAP.Common;
using BCP.Upload.ApiClient;
using BCP.Upload.ApiClient.DataContracts;
using BCP.Upload.DataContracts;

namespace BCP.Upload.AdminExtension.Controllers
{
    /// <summary>
    /// Controller class for AdminExtension.
    /// </summary>
    [RequireHttps]
    [OutputCache(Location = OutputCacheLocation.None)]
    [PortalExceptionHandler]
    public sealed class StorageAdminController : ExtensionController
    {
        private static readonly string adminAPIUri = OnPremPortalConfiguration.Instance.RdfeAdminUri;
        //This model is used to show registered resource provider information
        public EndpointModel StorageServiceEndPoint { get; set; }

        

        /// <summary>
        /// Gets the admin settings.
        /// </summary>
        [HttpPost]
        [ActionName("AdminSettings")]
        public async Task<JsonResult> GetAdminSettings()
        {
            try
            {
                var resourceProvider = await ClientFactory.AdminManagementClient.GetResourceProviderAsync
                                                           (UploadClient.RegisteredServiceName, Guid.Empty.ToString());

                this.StorageServiceEndPoint = EndpointModel.FromResourceProviderEndpoint(resourceProvider.AdminEndpoint);
                return this.JsonDataSet(this.StorageServiceEndPoint);
            }
            catch (ManagementClientException managementException)
            {
                // 404 means the Upload resource provider is not yet configured, return an empty record.
                if (managementException.StatusCode == HttpStatusCode.NotFound)
                {
                    return this.JsonDataSet(new EndpointModel());
                }

                //Just throw if there is any other type of exception is encountered
                throw;

            }
        }

        /// <summary>
        /// Update admin settings => Register Resource Provider
        /// </summary>
        /// <param name="newSettings">The new settings.</param>
        [HttpPost]
        [ActionName("UpdateAdminSettings")]
        public async Task<JsonResult> UpdateAdminSettings(EndpointModel newSettings)
        {
            this.ValidateInput(newSettings);

            DataContracts.ResourceProvider StorageResourceProvider;
            string errorMessage = string.Empty;

            //BillingResourceProvider = await resourceProviderService.CheckIfBillingResourceProviderExists();

            try
            {
                //Check if resource provider is already registered or not
                //string guid = "BA22B1B9-46D4-439B-909E-7579A2DAAF38";
                StorageResourceProvider = await ClientFactory.AdminManagementClient.GetResourceProviderAsync(UploadClient.RegisteredServiceName, Guid.Empty.ToString());
            }
            catch (ManagementClientException exception)
            {
                // 404 means the Storage resource provider is not yet configured, return an empty record.
                if (exception.StatusCode == HttpStatusCode.NotFound)
                {
                    StorageResourceProvider = null;
                }
                else
                {
                    //Just throw if there is any other type of exception is encountered
                    throw;
                }
            }

            if (StorageResourceProvider != null)
            {
                //Resource provider already registered so lets update endpoint
                StorageResourceProvider.AdminEndpoint = newSettings.ToAdminEndpoint();
                StorageResourceProvider.TenantEndpoint = newSettings.ToTenantEndpoint();
                StorageResourceProvider.NotificationEndpoint = newSettings.ToNotificationEndpoint();
                StorageResourceProvider.UsageEndpoint = newSettings.ToUsageEndpoint();
            }
            else
            {
                //Resource provider not registered yet so lets register new one now
                StorageResourceProvider = new DataContracts.ResourceProvider()
                {
                    Name = UploadClient.RegisteredServiceName,
                    DisplayName = "Upload",
                    InstanceDisplayName = UploadClient.RegisteredServiceName + " Instance",
                    Enabled = true,
                    PassThroughEnabled = true,
                    AllowAnonymousAccess = false,
                    AdminEndpoint = newSettings.ToAdminEndpoint(),
                    TenantEndpoint = newSettings.ToTenantEndpoint(),
                    NotificationEndpoint = newSettings.ToNotificationEndpoint(),
                    UsageEndpoint = newSettings.ToUsageEndpoint(),
                    MaxQuotaUpdateBatchSize = 3 // Check link http://technet.microsoft.com/en-us/library/dn520926(v=sc.20).aspx
                };
            }

            var testList = new DataContracts.ResourceProviderVerificationTestList()
                               {
                                   new DataContracts.ResourceProviderVerificationTest()
                                   {
                                       TestUri = new Uri(StorageAdminController.adminAPIUri + UploadClient.AdminSettings),
                                       IsAdmin = true
                                   }
                               };
            try
            {
                // Resource Provider Verification to ensure given endpoint and username/password is correct
                // Only validate the admin RP since we don't have a tenant subscription to do it.
                var result = await ClientFactory.AdminManagementClient.VerifyResourceProviderAsync(StorageResourceProvider, testList);
                if (result.HasFailures)
                {
                    throw new HttpException("Invalid endpoint or bad username/password");
                }
            }

            catch (ManagementClientException ex)
            {
                throw new HttpException("Invalid endpoint or bad username/password " + ex.Message.ToString());
            }

            //Finally Create Or Update resource provider
            Task<DataContracts.ResourceProvider> rpTask = (string.IsNullOrEmpty(StorageResourceProvider.Name) || String.IsNullOrEmpty(StorageResourceProvider.InstanceId))
                                                ? ClientFactory.AdminManagementClient.CreateResourceProviderAsync(StorageResourceProvider)
                                                : ClientFactory.AdminManagementClient.UpdateResourceProviderAsync(StorageResourceProvider.Name, StorageResourceProvider.InstanceId, StorageResourceProvider);


            try
            {
                await rpTask;
            }
            catch (ManagementClientException e)
            {
                throw e;
            }

            return this.Json(newSettings);
        }

        /// <summary>
        /// Gets all Shares.
        /// </summary>
        /// <remarks>
        /// Think of share as 'Region' for storage. This is for demonstration only.
        /// </remarks>
        [HttpPost]
        [ActionName("Shares")]
        public async Task<JsonResult> GetAllShares()
        {
            try
            {
                var localtions = await ClientFactory.StorageClient.GetShareListAsync();
                var result = localtions.Select(d => new ShareModel(d)).ToList();

                return this.JsonDataSet(result);
            }
            catch (HttpRequestException ex)
            {
                // Returns an empty collection if the HTTP request to the API fails
                return this.JsonDataSet(new ShareList());
            }
        }


        /// <summary>
        /// Gets all File Servers.
        /// </summary>
        [HttpPost]
        [ActionName("CreateShare")]
        public async Task<JsonResult> CreateShare(Share share)
        {
            try
            {
                await ClientFactory.StorageClient.AddShareAsync(share);
                return this.JsonDataSet(new object());
            }
            catch (HttpRequestException ex)
            {
                // http://msdn.microsoft.com/en-us/library/dn528486.aspx
                throw new PortalException(ex.Message, ex, HttpStatusCode.BadRequest);
            }
        }

        /// <summary>
        /// Delete selected share
        /// </summary>
        [HttpPost]
        [ActionName("DeleteShare")]
        public async Task<JsonResult> DeleteShare(int id)
        {
            try
            {
                await ClientFactory.StorageClient.DeleteShareAsync(id);
                return this.JsonDataSet(new object());
            }
            catch (HttpRequestException ex)
            {
                // http://msdn.microsoft.com/en-us/library/dn528486.aspx
                throw new PortalException(ex.Message, ex, HttpStatusCode.BadRequest);
            }
        }

        /// <summary>
        /// Get All Users
        /// </summary>
        [HttpPost]
        [ActionName("GetAllUsers")]
        public async Task<JsonResult> GetAllUsers()
        {
            //ListUsersAsync
            var users = await ClientFactory.AdminManagementClient.ListUsersAsync(new Query { });
            var result = users.items;
            return this.JsonDataSet(result);
        }

        /// <summary>
        /// Get Subscriptions For User
        /// </summary>
        [HttpPost]
        [ActionName("GetSubscriptionsForUser")]
        public async Task<QueryResult<DataContracts.Subscription>> GetSubscriptionsForUser(string userId)
        {
            var result = await ClientFactory.AdminManagementClient.ListUserSubscriptionsAsync(userId, new Query { });

            return result;
        }

        private void ValidateInput(EndpointModel newSettings)
        {
            if (newSettings == null)
            {
                throw new ArgumentNullException("newSettings");
            }

            if (String.IsNullOrEmpty(newSettings.EndpointAddress))
            {
                throw new ArgumentNullException("EndpointAddress");
            }

            if (String.IsNullOrEmpty(newSettings.Username))
            {
                throw new ArgumentNullException("Username");
            }

            // Note: We do not run validation on password, as password is not null, only when a change is required.
        }
    }
}
