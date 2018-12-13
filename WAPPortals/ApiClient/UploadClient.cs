// ---------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using BCP.Upload.ApiClient.DataContracts;
using BCP.Upload.DataContracts;
using System.Linq;

namespace BCP.Upload.ApiClient
{
    /// <summary>
    /// This is client of Billing Resource Provider
    /// This client is used by admin and tenant extensions to make call to Billing Resource Provider
    /// In real world you should have seperate clients of admin and tenant extensions
    /// </summary>
    public class UploadClient
    {
        public const string RegisteredServiceName = "Upload";
        public const string RegisteredPath = "services/" + RegisteredServiceName;
        public const string AdminSettings = RegisteredPath + "/settings";

        
        public const string BillingCurrentRecords = "{0}/" + RegisteredPath + "/ListCurrentBillingRecordDetails";
        private static string GetResourceTypes = RegisteredPath + "/billing/GetResourceTypes";
        private static string GetResourcesByTypeId = RegisteredPath + "/billing/GetResourcesByResourceTypeId";

        public const string UploadRecords = "{0}/" + RegisteredPath + "/ListUploadRecords/{1}";
        public const string TenantFilesInFolder = "{0}/" + RegisteredPath + "/CreateFile";
        public const string DeleteUploadRecord = "{0}/" + RegisteredPath + "/DeleteUploadRecord/{1}";
        public const string StorageShareForUser = "{0}/" + RegisteredPath + "/GetStorageShare/{1}";

        public const string AdminGetShares = RegisteredPath + "/shares/GetShareList";
        public const string AdminCreateShares = RegisteredPath + "/shares/AddShare";
        public const string AdminDeleteShare = RegisteredPath + "/shares/DeleteShare/{0}";
        

        public Uri BaseEndpoint { get; set; }

        public HttpClient httpClient;

        /// <summary>
        /// This constructor takes BearerMessageProcessingHandler which reads token as attach to each request
        /// </summary>
        /// <param name="baseEndpoint"></param>
        /// <param name="handler"></param>
        public UploadClient(Uri baseEndpoint, MessageProcessingHandler handler)
        {
            if (baseEndpoint == null)
            {
                throw new ArgumentNullException("baseEndpoint");
            }

            this.BaseEndpoint = baseEndpoint;

            this.httpClient = new HttpClient(handler);
        }

        public UploadClient(Uri baseEndpoint, string bearerToken, TimeSpan? timeout = null)
        {
            if (baseEndpoint == null)
            {
                throw new ArgumentNullException("baseEndpoint");
            }

            this.BaseEndpoint = baseEndpoint;

            this.httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);

            if (timeout.HasValue)
            {
                this.httpClient.Timeout = timeout.Value;
            }
        }

        #region Shared Admin/Tenant
        private static string CreateCurrentUri(string subscriptionId)
        {
            return string.Format(CultureInfo.InvariantCulture, UploadClient.BillingCurrentRecords, subscriptionId);
        }

        /// <summary>
        /// Upload file to storage folder.
        /// </summary>
        public async Task UploadForTenantAsync(string subscriptionId, StorageFile file)
        {
            var requestUrl = this.CreateRequestUri(string.Format(CultureInfo.InvariantCulture, UploadClient.TenantFilesInFolder , subscriptionId /*, folderId*/));
            await this.PostAsync<StorageFile>(requestUrl, file);
        }

        public async Task<List<UploadRecord>> ListUploadRecordsAsync(string subscriptionId, int userId)
        {
            ///var requestUrl = this.CreateRequestUri(UploadClient.CreateUri(subscriptionId));
            var requestUrl = this.CreateRequestUri(string.Format(CultureInfo.InvariantCulture, UploadClient.UploadRecords, subscriptionId, userId));
            return await this.GetAsync<List<UploadRecord>>(requestUrl);
        }

        public async Task<Share> GetStorageShareAsync(string subscriptionId, int userId)
        {
            var requestUrl = this.CreateRequestUri(string.Format(CultureInfo.InvariantCulture, UploadClient.StorageShareForUser, subscriptionId, userId) );
            return await this.GetAsync<Share>(requestUrl);
        }


        public async Task DeleteUploadRecordAsync(string subscriptionId, int id)
        {
            var requestUrl = this.CreateRequestUri(string.Format(CultureInfo.InvariantCulture, UploadClient.DeleteUploadRecord, subscriptionId, id));

            await this.PostAsync<int>(requestUrl,id);
        }


        private static string CreateUri(string subscriptionId)
        {
            return string.Format(CultureInfo.InvariantCulture, UploadClient.UploadRecords, subscriptionId);
        }

        #endregion

        #region Admin APIs
        /// <summary>
        /// GetAdminSettings returns Billing Resource Provider endpoint information if its registered with Admin API
        /// </summary>
        /// <returns></returns>
        public async Task<AdminSettings> GetAdminSettingsAsync()
        {
            var requestUrl = this.CreateRequestUri(UploadClient.AdminSettings);

            // For simplicity, we make a request synchronously.
            var response = await this.httpClient.GetAsync(requestUrl, HttpCompletionOption.ResponseContentRead);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsAsync<AdminSettings>();
        }

        /// <summary>
        /// UpdateAdminSettings registers Billing Resource Provider endpoint information with Admin API
        /// </summary>
        /// <returns></returns>
        public async Task UpdateAdminSettingsAsync(AdminSettings newSettings)
        {
            var requestUrl = this.CreateRequestUri(UploadClient.AdminSettings);
            var response = await this.httpClient.PutAsJsonAsync<AdminSettings>(requestUrl.ToString(), newSettings);
            response.EnsureSuccessStatusCode();
        }

        
        #endregion

      

        #region Admin APIs
      
        /// <summary>
        /// GetShareList return list of file servers hosted in Storage  Resource Provider
        /// </summary>
        /// <returns></returns>
        public async Task<List<Share>> GetShareListAsync()
        {
            var requestUrl = this.CreateRequestUri(string.Format(CultureInfo.InvariantCulture, UploadClient.AdminGetShares));

            var response = await this.httpClient.GetAsync(requestUrl, HttpCompletionOption.ResponseContentRead);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsAsync<List<Share>>();
        }

        /// <summary>
        /// UpdateShare updates existing file server information in Storage Resource Provider
        /// </summary>        
        public async Task UpdateShareAsync(Share share)
        {
            var requestUrl = this.CreateRequestUri(UploadClient.AdminDeleteShare);
            var response = await this.httpClient.PutAsJsonAsync<Share>(requestUrl.ToString(), share);
            response.EnsureSuccessStatusCode();
        }

        /// <summary>
        /// AddShare adds new file server in Storage Resource Provider
        /// </summary>        
        public async Task AddShareAsync(Share share)
        {
            var requestUrl = this.CreateRequestUri(string.Format(CultureInfo.InvariantCulture, UploadClient.AdminCreateShares));
            await this.PostAsync<Share>(requestUrl, share);
        }

        /// <summary>
        /// DeleteLocation removes file server in Storage Resource Provider
        /// </summary>        
        public async Task DeleteShareAsync(int id)
        {   
            var requestUrl = this.CreateRequestUri(string.Format(CultureInfo.InvariantCulture, UploadClient.AdminDeleteShare,id));
            await this.PostAsync<int>(requestUrl, id);
        }

        #endregion

        #region Private Methods
        /// <summary>
        /// Common method for making GET calls
        /// </summary>
        private async Task<T> GetAsync<T>(Uri requestUrl)
        {
            var response = await this.httpClient.GetAsync(requestUrl, HttpCompletionOption.ResponseHeadersRead);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsAsync<T>();
        }

        /// <summary>
        /// Common method for making POST calls
        /// </summary>
        private async Task PostAsync<T>(Uri requestUrl, T content)
        {
            var response = await this.httpClient.PostAsXmlAsync<T>(requestUrl.ToString(), content);
            response.EnsureSuccessStatusCode();
        }


        /// <summary>
        /// Common method for making PUT calls
        /// </summary>
        private async Task PutAsync<T>(Uri requestUrl, T content)
        {
            var response = await this.httpClient.PutAsJsonAsync<T>(requestUrl.ToString(), content);
            response.EnsureSuccessStatusCode();
        }

        /// <summary>
        /// Common method for making Request Uri's
        /// </summary>
        private Uri CreateRequestUri(string relativePath, string queryString = "")
        {
            var endpoint = new Uri(this.BaseEndpoint, relativePath);
            var uriBuilder = new UriBuilder(endpoint);
            uriBuilder.Query = queryString;
            return uriBuilder.Uri;
        }

       

       

        public async Task<List<ResourceTypeDTO>> GetResourceTypesAsync()
        {
            var requestUrl = this.CreateRequestUri(UploadClient.GetResourceTypes);

            var response = await this.httpClient.GetAsync(requestUrl, HttpCompletionOption.ResponseContentRead);
            response.EnsureSuccessStatusCode();

            List<ResourceTypeDTO> result = await response.Content.ReadAsAsync<List<ResourceTypeDTO>>();

            return result;
        }

        public async Task<List<ResourceDTO>> GetResourcesAsync(int resourceTypeId)
        {
            var requestUrl = this.CreateRequestUri(string.Format(CultureInfo.InvariantCulture, UploadClient.GetResourcesByTypeId), "resourceTypeId=" + resourceTypeId);

            var response = await this.httpClient.GetAsync(requestUrl, HttpCompletionOption.ResponseContentRead);
            response.EnsureSuccessStatusCode();

            List<ResourceDTO> result = await response.Content.ReadAsAsync<List<ResourceDTO>>();

            return result;
        }

        #endregion

    }
}
