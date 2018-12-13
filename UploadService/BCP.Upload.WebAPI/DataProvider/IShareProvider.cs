
using System.Collections.Generic;
//using BCP.Upload.ApiClient.DataContracts;
using BCP.Upload.Data;

namespace BCP.Upload.WebApi.DataProvider
{
    public interface IShareProvider
    {
        List<Share> GetShares(string subscriptionId = null);

        Share GetStorageShare(int userId);

        void CreateShare(Share location);

        void UpdateShare(Share location);

        void DeleteShare(Share location);
    }
}
