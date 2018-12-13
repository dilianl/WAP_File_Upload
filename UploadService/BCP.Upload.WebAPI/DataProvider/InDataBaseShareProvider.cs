
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Web;
//using BCP.Upload.Data;
//using BCP.Upload.ApiClient.DataContracts;
using BCP.Upload.Data;

namespace BCP.Upload.WebApi.DataProvider
{
    /// <summary>
    /// Share data provider with process memory as storage. If we restart IIS, information is lost.
    /// </summary>
    public class InDataBaseShareProvider : IShareProvider
    {
        private static InDataBaseShareProvider instance = new InDataBaseShareProvider();

        public static List<Share> locations = new List<Share>();

        public static IShareProvider Instance
        {
            get { return instance; }
        }

        List<Share> IShareProvider.GetShares(string subscriptionId)
        {
            return UploadManager.GetAllShares();
        }

        Share IShareProvider.GetStorageShare(int userId)
        {
            return UploadManager.GetShare(userId);
        }

        void IShareProvider.CreateShare(Share location)
        {
            UploadManager.CreateShare(location.ShareName, location.TotalSpace, location.NetworkSharePath, location.UserId, location.UserName);
        }

        void IShareProvider.UpdateShare(Share location)
        {
            var existingShare = (from s in locations where s.ShareId == location.ShareId select s).First();
            existingShare.TotalSpace = location.TotalSpace;
            existingShare.FreeSpace = location.FreeSpace;

            // For now, we only allow updating free and total space. 
            // We do not allow the location name or path to be edited, as files will be already written there.
            ////existingShare.ShareName = location.ShareName;
            ////existingShare.NetworkSharePath = location.NetworkSharePath;
        }

        void IShareProvider.DeleteShare(Share location)
        {
            // Call will come here only if the location is valid.
            if (location != null)
            {
                UploadManager.DeleteShare(location.ShareId);
            }
        }
    }
}
