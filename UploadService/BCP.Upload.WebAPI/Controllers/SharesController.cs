
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web.Http;
using BCP.Upload.WebApi.DataProvider;
using BCP.Upload.Data;
//using BCP.Upload.ApiClient.DataContracts;

namespace BCP.Upload.WebApi.Controllers
{
    public class SharesController : ApiController
    {
        [HttpGet]
        [ActionName("GetShareList")]
        public List<Share> GetShareList(string subscriptionId = null)
        {
            return DataProviderFactory.ShareInstance.GetShares();
        }

        [HttpPut]
        public void UpdateShare(ApiClient.DataContracts.Share share)
        {
            Share location = new Share();
            location.FreeSpace = share.FreeSpace;
            location.NetworkSharePath = share.NetworkSharePath;
            location.TotalSpace = share.TotalSpace;
            location.ShareName = share.ShareName;

            if (location == null)
            {
                throw ResponseExceptionHelper.ThrowResponseException(this.Request, System.Net.HttpStatusCode.BadRequest, ErrorMessages.ShareEmpty);
            }
            
            var locations = DataProviderFactory.ShareInstance.GetShares();
            var existingShare = (from s in locations where s.ShareId == location.ShareId select s).FirstOrDefault();

            if (existingShare == null)
            {
                string message = string.Format(CultureInfo.CurrentCulture, ErrorMessages.ShareNotFound, location.ShareName);
                throw ResponseExceptionHelper.ThrowResponseException(null, System.Net.HttpStatusCode.BadRequest, message);
            }

            DataProviderFactory.ShareInstance.UpdateShare(location);
        }

        [HttpPost]
        public void AddShare(ApiClient.DataContracts.Share share)
        {
            Share location = new Share();
            location.FreeSpace = share.FreeSpace;
            location.NetworkSharePath = share.NetworkSharePath;
            location.TotalSpace = share.TotalSpace;
            location.ShareName = share.ShareName;
            location.UserName = share.UserName;
            location.UserId = share.UserName.GetHashCode();

            if (location == null)
            {
                throw ResponseExceptionHelper.ThrowResponseException(this.Request, System.Net.HttpStatusCode.BadRequest, ErrorMessages.ShareEmpty);
            }

            if (!DataValidationUtil.IsShareValid(location))
            {
                string message = string.Format(CultureInfo.CurrentCulture, ErrorMessages.NullInput);
                throw ResponseExceptionHelper.ThrowResponseException(null, System.Net.HttpStatusCode.BadRequest, message);
            }

            var locations = DataProviderFactory.ShareInstance.GetShares();
            var existingShare = (from s in locations where s.ShareName.ToLower() == location.ShareName.ToLower() select s).FirstOrDefault();
            if (existingShare != null)
            {
                string message = string.Format(CultureInfo.CurrentCulture, ErrorMessages.ShareAlreadyExist, location.ShareName);
                throw ResponseExceptionHelper.ThrowResponseException(null, System.Net.HttpStatusCode.BadRequest, message);
            };

            if (!DataValidationUtil.IsNetworkShareReachable(location.NetworkSharePath))
            {
                string message = string.Format(CultureInfo.CurrentCulture, ErrorMessages.ShareNotFound, location.NetworkSharePath);
                throw ResponseExceptionHelper.ThrowResponseException(null, System.Net.HttpStatusCode.BadRequest, message);
            }

            // Trim trailing slash and space from path.
            location.NetworkSharePath = location.NetworkSharePath.TrimEnd(new char[] { ' ', '\\' });
            if (DataValidationUtil.IsNetworkAlreadyMapped(location.NetworkSharePath, locations))
            {
                string message = string.Format(CultureInfo.CurrentCulture, ErrorMessages.NetworkShareAlreadyMapped, location.NetworkSharePath);
                throw ResponseExceptionHelper.ThrowResponseException(null, System.Net.HttpStatusCode.BadRequest, message);
            }

            //Check if user exist
            var shareExist = DataProviderFactory.ShareInstance.GetStorageShare(location.UserId);
            if( shareExist != null)
            {
                string message = string.Format(CultureInfo.CurrentCulture, ErrorMessages.UserExist, location.UserName);
                throw ResponseExceptionHelper.ThrowResponseException(null, System.Net.HttpStatusCode.BadRequest, message);
            }

            DataProviderFactory.ShareInstance.CreateShare(location);
        }

        [HttpPost]
        public void DeleteShare(int id)
        {
            if (id == 0)
            {
                throw ResponseExceptionHelper.ThrowResponseException(this.Request, System.Net.HttpStatusCode.BadRequest, ErrorMessages.ShareEmpty);
            }

            var locations = DataProviderFactory.ShareInstance.GetShares();
            var existingShare = (from s in locations where s.ShareId == id select s).FirstOrDefault();

            if (existingShare == null)
            {
                string message = string.Format(CultureInfo.CurrentCulture, ErrorMessages.ShareNotFound);
                throw ResponseExceptionHelper.ThrowResponseException(null, System.Net.HttpStatusCode.BadRequest, message);
            }

            DataProviderFactory.ShareInstance.DeleteShare(existingShare);
        }

    }
}
