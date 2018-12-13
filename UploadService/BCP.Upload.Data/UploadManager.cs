using BCP.Upload.Common;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AnalysisServices.AdomdClient;
using System.Data;
using System.Configuration;
using NLog;
using System.IO;
using System.Threading;

namespace BCP.Upload.Data
{
    public class UploadManager
    {
        #region Message Constants

        private const string MSG_InvalidSubscriptionId = "Invalid Subscription ID";
        private const string MSG_RateCardIsNull = "Rate Card is Null!";
        private const string MSG_RateCardIdAssigned = "RateCardLine must have RateCardId assigned!";
        private const string MSG_RCAssignRequestIsNull = "RateCardAssignRequest is null";
        private const string MSG_InvalidId = "Invalid Object ID";
        private const string MSG_RateCardHeaderIsNull = "RateCardHeader is null";
        private const string MSG_InvalidRCLineId = "Invalid RateCard Line ID";
        private const string MSG_ItemNotFound = "Item with id: {0} was not found.";
        private const string MSG_BillingRecordIsNull = "Billing Record is Null or not specified!";
        private const string MSG_BillingRecordDetailIsNull = "BillingRecordDetail is null or not specified!";
        private const string MSG_InvalidPeriod = "Invalid period specified";
        private const string MSG_ResourceIsNull = "Resource is Null!";
        private const string MSG_ResourceTypeIsNull = "Resource Type is Null!";
        private const string MSG_InvalidResourceType = "Invalid Resource Type is specified!";
        private const string MSG_NameIsNull = "Name cannot be empty!";
        private const string MSG_InvalidRateCardId = "Invalid RateCard ID";
        private const string MSG_InvalidCurrency = "Invalid Currency value";

        private const string RESOURCE_TYPE_CPU = "CPU";
        private const string RESOURCE_TYPE_COMPUTE = "COMPUTE";
        private const string RESOURCE_TYPE_RAM = "MEMORY";
        private const string RESOURCE_TYPE_DISK = "STORAGE";

        private const string STATUS_ACTIVE = "ACTIVE";
        private const string STATUS_STOPPED = "STOPPED";

        #endregion


        private static ILogger logger = LogManager.GetLogger("UploadManager");
        private static string _usageConnectionString;
        private static bool _auditEnabled;


        static UploadManager()
        {

            _usageConnectionString = ConfigurationManager.ConnectionStrings["UsageConnection"].ConnectionString;

            if (!string.IsNullOrEmpty(ConfigurationManager.AppSettings["AuditEnabled"]))
            {
                bool tmpVar;
                if (bool.TryParse(ConfigurationManager.AppSettings["AuditEnabled"], out tmpVar))
                {
                    _auditEnabled = tmpVar;
                }
                else
                {
                    logger.Warn("Invalid value specified for AuditEnabled Application Setting");
                }
            }

            logger.Info("Upload Manager initialized");
        }

        

        #region Upload 

        public static List<UploadRecord> GetAllUploadRecords(int userId)
        {
            List<UploadRecord> result = null;
            //using (BillingContext ctx = new BillingContext())
            //{
            //    ctx.Configuration.LazyLoadingEnabled = false;

            //    return ctx.BillingRecords.Include(i => i.Currency).AsNoTracking()
            //                .Where(br => br.SubscriptionId.Equals(subscriptionId))
            //                .OrderByDescending(i => i.Year)
            //                .ThenByDescending(i => i.Month)
            //                .ToList();
            //}

            //int userId = 1;

            using (UploadContext ctx = new UploadContext())
            {
                ctx.Configuration.LazyLoadingEnabled = false;
                var share = ctx.Shares
                                 .Where(s => s.UserId == userId)
                                 .FirstOrDefault();

                result = ctx.UploadRecords
                            .Where(br => br.ShareId.Equals(share.ShareId))
                            .OrderByDescending(i => i.CreatedDate)
                            .ToList();
            }

            return result;
        }

        public static bool CreateUploadRecords(string storageFileName, long size, int shareId)
        {
            bool result = false;
            using( UploadContext ctx = new UploadContext())
            {
                Share share = ctx.Shares.Where(s => s.ShareId == shareId).FirstOrDefault();
                UploadRecord file = new UploadRecord();
                string[] arrayName = storageFileName.Split('.');
                file.ShareId = shareId;
                file.CloudId = 1;
                file.Container = string.Empty;
                file.Description = "Description";
                file.Extension = arrayName.Length > 1 ? arrayName[1] : string.Empty;
                file.FileCloudName = "Azure Pack";
                file.IsHidden = false;
                file.IsShared = false;
                file.Name = arrayName.Length > 0 ? arrayName[0] : storageFileName;
                file.MimeType = arrayName.Length > 1 ? arrayName[1]: string.Empty;
                file.Size = size;
                file.CreatedDate = DateTime.Now;
                file.ExpiredDate = file.CreatedDate.AddDays(7);

                ctx.UploadRecords.Add(file);
                ctx.SaveChanges();

                //Update Share with new freeSpace
                int newFreeSpace = share.FreeSpace - (int)size;
                UpdateShare(share.ShareId, newFreeSpace);

                result = true;
            }

            return result;
        }

       
        public static bool DeleteUploadRecord(int id)
        {
            bool result = false;
            using (UploadContext ctx = new UploadContext())
            {
                var uploadFile = ctx.UploadRecords.Where(f => f.Id == id).FirstOrDefault();
                if (uploadFile != null)
                {
                    var share = ctx.Shares.Where(s => s.ShareId == uploadFile.ShareId).FirstOrDefault();
                    string pathFile = share.NetworkSharePath + "/" + uploadFile.Name + "." + uploadFile.Extension;

                    if (!File.Exists(pathFile))
                    {
                        return false;
                    }

                    bool isDeleted = false;
                    while (!isDeleted)
                    {
                        try
                        {
                            File.Delete(pathFile);
                            isDeleted = true;
                        }
                        catch (Exception e)
                        {
                        }
                        Thread.Sleep(50);
                    }

                    // Delete from Database
                    ctx.Database.ExecuteSqlCommand("Delete from UploadRecord where id=@id", new SqlParameter("@id", id));

                    // Share with new freeSpace
                    int newFreeSpace = share.FreeSpace + (int)uploadFile.Size;
                    UpdateShare(share.ShareId, newFreeSpace);

                    result = true;
                }
            }

            return result;
        }

        #endregion
        

        #region Shares

        public static List<Share> GetAllShares()
        {
            List<Share> result;

            using (UploadContext ctx = new UploadContext())
            {
                ctx.Configuration.LazyLoadingEnabled = false;

                result = ctx.Shares
                            .OrderBy(i => i.ShareId)
                            .ToList();
            }

            return result;
        }

        public static Share GetShare(int userId)
        {
            Share result;
            using (UploadContext ctx = new UploadContext())
            {
                ctx.Configuration.LazyLoadingEnabled = false;
                result = ctx.Shares.Where(i => i.UserId == userId)
                    .SingleOrDefault();
            }

            return result;
        }

        public static bool CreateShare(string shareName, int totalSpace, string networkSharePath, int userId, string userName)
        {
            bool result = false;

            using (UploadContext ctx = new UploadContext())
            {
                ctx.Configuration.LazyLoadingEnabled = false;

                var location = new Share
                {
                    ShareName = shareName,
                    TotalSpace = totalSpace,
                    FreeSpace = totalSpace,   // When we start, all space is free.
                    NetworkSharePath = networkSharePath,
                    UserName = userName,
                    UserId = userId
                };

                ctx.Shares.Add(location);
                ctx.SaveChanges();
                result = true;
            }

            return result;
        }

        public static bool DeleteShare(int id)
        {
            bool result = false;

            using (UploadContext ctx = new UploadContext())
            {
                ctx.Configuration.LazyLoadingEnabled = false;

                // Delete from Database
                ctx.Database.ExecuteSqlCommand("Delete from Share where ShareId=@id", new SqlParameter("@id", id));
                result = true;
            }

            return result;
        }

        public static bool UpdateShare(int id, int newFreeSpace)
        {
            bool result = false;

            using (UploadContext ctx = new UploadContext())
            {
                ctx.Configuration.LazyLoadingEnabled = false;

                // Delete from Database
                ctx.Database.ExecuteSqlCommand("UPDATE Share SET FreeSpace=@newFreeSpace WHERE ShareId=@id", new SqlParameter("@id", id), new SqlParameter("@newFreeSpace", newFreeSpace));
                result = true;
            }

            return result;
        }
        #endregion


    }
}
