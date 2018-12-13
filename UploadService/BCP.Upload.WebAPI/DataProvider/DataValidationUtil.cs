
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using BCP.Upload.Data;
//using BCP.Upload.ApiClient.DataContracts;

namespace BCP.Upload.WebApi.DataProvider
{
    public class DataValidationUtil
    {
        internal static bool IsNetworkShareReachable(string path)
        {
            return Directory.Exists(path);
        }

        internal static bool IsNetworkAlreadyMapped(string path, List<Share> shares)
        {
            var existingShare = (from s in shares where s.NetworkSharePath.ToLower() == path.ToLower() select s).FirstOrDefault();
            return existingShare != null;
        }

        internal static bool IsShareValid(Share share)
        {
            if (share == null ||
                share.TotalSpace <= 0 ||
                string.IsNullOrWhiteSpace(share.NetworkSharePath) ||
                string.IsNullOrWhiteSpace(share.ShareName))
            {
                return false;
            }

            return true;
        }
    }
}
