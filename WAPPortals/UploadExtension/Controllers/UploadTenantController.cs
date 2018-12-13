//-----------------------------------------------------------------------
//   Copyright (c) Microsoft Corporation.  All rights reserved.
//-----------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;
using BCP.Upload.WAP.Common;
using BCP.Upload.ApiClient.DataContracts;
using Microsoft.Azure.Portal.Filters;
using Microsoft.Azure.Portal;
using System.Text;
using System.IO;

namespace BCP.Upload.TenantExtension.Controllers
{
    [RequireHttps]
    [OutputCache(Location = OutputCacheLocation.None)]
    [PortalExceptionHandler]
    public sealed class UploadTenantController : ExtensionController
    {
        //string UploadPath;

        /// <summary>
        /// Upload file to a storage folder.
        /// </summary>
        /// <param name="subscriptionId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<JsonResult> UploadStorageFileAsync(string subscriptionId, string fileSharePath, int shareId)
        {
            string UploadPath = fileSharePath;
            decimal procent = 0M;
            foreach (string file in Request.Files)
            {
                var FileDataContent = Request.Files[file];
                if (FileDataContent != null && FileDataContent.ContentLength > 0)
                {
                    // take the input stream, and save it to a temp folder using the original file.part name posted
                    var stream = FileDataContent.InputStream;
                    var fileName = Path.GetFileName(FileDataContent.FileName);
                    
                    Directory.CreateDirectory(UploadPath);
                    string path = Path.Combine(UploadPath, fileName);
                    try
                    {
                        if (System.IO.File.Exists(path))
                            System.IO.File.Delete(path);
                        using (var fileStream = System.IO.File.Create(path))
                        {
                            stream.CopyTo(fileStream);
                        }
                        // Once the file part is saved, see if we have enough to merge it
                        Helper helper = new Helper();
                        procent = await helper.MergeFileAsync(path, subscriptionId, shareId);
                        return this.JsonDataSet(procent);
                    }
                    catch (IOException ex)
                    {
                        // handle
                    }
                }
            }
            
            return this.JsonDataSet(procent);
        }

        /// <summary>
        /// List UploadRecords
        /// </summary>
        /// <param name="subscriptionIds"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<JsonResult> ListUploadRecords(string subscriptionId, string userId)
        {
            if (String.IsNullOrWhiteSpace(subscriptionId))
            {
                throw new HttpException("Subscription Id not found.");
            }
            var uploadRecordsFromApi = await ClientFactory.UploadClient.ListUploadRecordsAsync(subscriptionId, userId.GetHashCode());

            return this.JsonDataSet(uploadRecordsFromApi);
        }

        [HttpPost]
        public async Task<JsonResult> DeleteUploadRecord(string subscriptionId, int id)
        {
            await ClientFactory.UploadClient.DeleteUploadRecordAsync(subscriptionId,id);

            return this.JsonDataSet(new object());
        }

        /// <summary>
        /// Get Share
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<JsonResult> GetStorageShare(string subscriptionId, string userId)
        {
            var share = await ClientFactory.UploadClient.GetStorageShareAsync(subscriptionId, userId.GetHashCode());
            return this.JsonDataSet(share);
        }
    }

    class Helper
    {
        public string FileName { get; set; }
        public string TempFolder { get; set; }
        public int MaxFileSizeMB { get; set; }
        public List<String> FileParts { get; set; }

        public Helper()
        {
            FileParts = new List<string>();
        }

        /// <summary>
        /// Merge File
        /// </summary>
        /// <param name="FileName"></param>
        /// <returns></returns>
        public async Task<decimal> MergeFileAsync(string FileName, string subscriptionId, int shareId)
        {
            //bool rslt = false;
            // parse out the different tokens from the filename according to the convention
            string partToken = ".part_";
            string baseFileName = FileName.Substring(0, FileName.IndexOf(partToken));
            string trailingTokens = FileName.Substring(FileName.IndexOf(partToken) + partToken.Length);
            int FileIndex = 0;
            int FileCount = 0;
            int.TryParse(trailingTokens.Substring(0, trailingTokens.IndexOf(".")), out FileIndex);
            int.TryParse(trailingTokens.Substring(trailingTokens.IndexOf(".") + 1), out FileCount);
            // get a list of all file parts in the temp folder
            string Searchpattern = Path.GetFileName(baseFileName) + partToken + "*";
            string[] FilesList = Directory.GetFiles(Path.GetDirectoryName(FileName), Searchpattern);
            decimal procent = Math.Round((decimal)FilesList.Count() / FileCount * 100, 0);
            long fileSize = 0;

            if (FilesList.Count() == FileCount)
            {
                // use a singleton to stop overlapping processes
                if (!MergeFileManager.Instance.InUse(baseFileName))
                {
                    MergeFileManager.Instance.AddFile(baseFileName);
                    if (File.Exists(baseFileName))
                        File.Delete(baseFileName);

                    List<SortedFile> MergeList = new List<SortedFile>();
                    foreach (string File in FilesList)
                    {
                        SortedFile sFile = new SortedFile();
                        sFile.FileName = File;
                        baseFileName = File.Substring(0, File.IndexOf(partToken));
                        trailingTokens = File.Substring(File.IndexOf(partToken) + partToken.Length);
                        int.TryParse(trailingTokens.Substring(0, trailingTokens.IndexOf(".")), out FileIndex);
                        sFile.FileOrder = FileIndex;
                        MergeList.Add(sFile);
                    }
                    // sort by the file-part number to ensure we merge back in the correct order
                    var MergeOrder = MergeList.OrderBy(s => s.FileOrder).ToList();
                    using (FileStream FS = new FileStream(baseFileName, FileMode.Create))
                    {
                        // merge each file chunk back into one contiguous file stream
                        foreach (var chunk in MergeOrder)
                        {
                            try
                            {
                                using (FileStream fileChunk = new FileStream(chunk.FileName, FileMode.Open))
                                {
                                    fileChunk.CopyTo(FS);
                                }

                                File.Delete(chunk.FileName);
                            }
                            catch (IOException ex)
                            {
                                // handle                                
                            }
                        }

                        //Size in GB 
                        fileSize = (long)Math.Round((decimal)FS.Length / (1024 * 1024 * 1024), 0);  
                    }
                    //rslt = true;

                    // unlock the file from singleton
                    MergeFileManager.Instance.RemoveFile(baseFileName);

                    //Save file in database
                    StorageFile file = new StorageFile();
                    string[] splitNames = FileName.Split('\\');
                    file.StorageFileName = splitNames[splitNames.Length-1];
                    file.TotalSize = fileSize;
                    file.ShareId = shareId;
                    await ClientFactory.UploadClient.UploadForTenantAsync(subscriptionId, file);
                }
            }
            return procent;
        }

       
    }

    public struct SortedFile
    {
        public int FileOrder { get; set; }
        public String FileName { get; set; }
    }

    public class MergeFileManager
    {
        private static MergeFileManager instance;
        private List<string> MergeFileList;

        private MergeFileManager()
        {
            try
            {
                MergeFileList = new List<string>();
            }
            catch { }
        }

        public static MergeFileManager Instance
        {
            get
            {
                if (instance == null)
                    instance = new MergeFileManager();
                return instance;
            }
        }

        public void AddFile(string BaseFileName)
        {
            MergeFileList.Add(BaseFileName);
        }

        public bool InUse(string BaseFileName)
        {
            return MergeFileList.Contains(BaseFileName);
        }

        public bool RemoveFile(string BaseFileName)
        {
            return MergeFileList.Remove(BaseFileName);
        }
    }

}
