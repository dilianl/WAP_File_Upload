using BCP.Upload.ApiClient.DataContracts;

namespace BCP.Upload.AdminExtension.Models
{
    public class ShareModel
    {
        public int ShareId { get; set; }

        public string ShareName { get; set; }

        public int TotalSpace { get; set; }
        
        public int FreeSpace { get; set; }

        public string NetworkSharePath { get; set; }

        public string UserName { get; set; }

        public ShareModel(Share location)
        {
            this.ShareId = location.ShareId;
            this.ShareName = location.ShareName;
            this.TotalSpace = location.TotalSpace;
            this.FreeSpace = location.FreeSpace;
            this.NetworkSharePath = location.NetworkSharePath;
            this.UserName = location.UserName;
        }
    }
}
