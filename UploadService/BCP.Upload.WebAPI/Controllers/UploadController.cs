using System;
using System.Linq;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Collections.Generic;
using System.Web.Http;

using BCP.Upload.Data;
using BCP.Upload.Common;
using NLog;
using System.IO;

namespace BCP.Upload.WebApi.Controllers
{
    public class UploadController : ApiController
    {
        private static Logger logger = LogManager.GetLogger("UploadController");

        public UploadController()
        {
        }


        [HttpPost]
        [ActionName("CreateFile")]
        public bool CreateFile(ApiClient.DataContracts.StorageFile file)
        {
            bool result = false;;
            result = UploadManager.CreateUploadRecords(file.StorageFileName, file.TotalSize, file.ShareId);

            return result;
        }

        [HttpPost]
        [ActionName("DeleteUploadRecord")]
        public bool DeleteUploadRecord(int id)
        {
            bool result = false;
            result = UploadManager.DeleteUploadRecord(id);
            return result;
        }


        [HttpGet]
        [ActionName("ListUploadRecords")]
        public List<UploadRecord> ListUploadRecords(int id)
        {
            var uploadRecords = UploadManager.GetAllUploadRecords(id);

            return uploadRecords;
        }


        [HttpGet]
        [ActionName("GetStorageShare")]
        public Share GetStorageShare(int id)
        {
            return UploadManager.GetShare(id);
        } 
    }

}