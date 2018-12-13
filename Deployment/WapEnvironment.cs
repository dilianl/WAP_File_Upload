using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO.Compression;

namespace Deployment
{
    public class WapEnvironment : Environment
    {
        public WapEnvironment()
            : base()
        {
           
        }

        public void CreateArchive()
        {
            IISReset();

            if (CreateBackup)
            {
                Environment.Output.WriteLine("Create backup of directory " + SoruceDirZip);
                string zipPath = DestDirZip + DateTime.Now.ToString("yyyy-MM-dd HH.mm.ss") + ".zip";
                ZipFile.CreateFromDirectory(SoruceDirZip, zipPath);
                Environment.Output.WriteLine("Backup is created successfully");
            }
        }

        public void IISReset()
        {
            //Reset IIS
            System.Diagnostics.Process.Start(@"C:\Windows\System32\iisreset.exe");
        }

        public void DeployWapService()
        {
            if (Environment.skipWapService) return;


            //deploy Billing WebAPI service
            Environment.Output.WriteLine("Web.API service  deployment starts.");           

            string billingWebApiSourcePath = MainSourcePath + "BillingServices\\BCP.Billing.WebAPI\\bin";
            string billingWebApiDestPath = MainDestPath + "MgmtSvc-Billing\\bin";
            string includePrefix = "BCP.Billing";

            CopyFolder(billingWebApiSourcePath, billingWebApiDestPath, includePrefix);
            Environment.Output.WriteLine("Web.API service deployed successfully.");
        }

        public void DeployWapUploadService()
        {
            if (Environment.skipWapService) return;


            //deploy Billing WebAPI service
            Environment.Output.WriteLine("Web.API Upload service  deployment starts.");

            string billingWebApiSourcePath = MainSourcePath + "UploadService\\BCP.Upload.WebAPI\\bin";
            string billingWebApiDestPath = MainDestPath + "MgmtSvc-Advanced\\bin";
            string includePrefix = "BCP.Upload";

            CopyFolder(billingWebApiSourcePath, billingWebApiDestPath, includePrefix);

            Environment.Output.WriteLine("Web.API Upload service deployed successfully.");
        }


        public void DeployAdminPortal()
        {
            RetryDeploy(() =>
            {
                if (!Environment.skipAdminsWeb)
                {
                    Environment.Output.WriteLine("Amdin portal  deployment starts.");

                    //List<string> adminWebSiteComponents = GetAdminWebSiteComponents();
                    //List<string> webSiteExcludedComponents = GetWebSiteExcludedComponents();
                    
                    //copy Content files
                    string webSiteSourcePath = MainSourcePath + "WAPPortals\\AdminExtension\\Content";
                    string webSiteDestPath = MainDestPath + "MgmtSvc-AdminSite\\Content\\BillingAdmin";
                    CopyFolder(webSiteSourcePath, webSiteDestPath);

                    //copy Manifest files
                    webSiteSourcePath = MainSourcePath + "WAPPortals\\AdminExtension\\Manifests";
                    webSiteDestPath = MainDestPath + "MgmtSvc-AdminSite\\Manifests";
                    CopyFolder(webSiteSourcePath, webSiteDestPath);

                    //copy Bin files
                    webSiteSourcePath = MainSourcePath + "WAPPortals\\AdminExtension\\bin\\Debug";
                    webSiteDestPath = MainDestPath + "MgmtSvc-AdminSite\\bin";
                    string includePrefix = "BCP.Billing";
                    CopyFolder(webSiteSourcePath, webSiteDestPath, includePrefix);

                    Environment.Output.WriteLine("Amdin portal deployed successfully.");
                }               
            });
        }


        public void DeployTenantPortal()
        {
            RetryDeploy(() =>
            {
                if (!Environment.skipTenantWeb)
                {
                    Environment.Output.WriteLine("Tenant portal deployment starts.");

                    //List<string> tenantWebSiteComponents = GetTenantWebSiteComponents();
                    //List<string> webSiteExcludedComponents = GetWebSiteExcludedComponents();

                    //copy Content files
                    string webSiteSourcePath = MainSourcePath + "WAPPortals\\TenantExtension\\Content";
                    string webSiteDestPath = MainDestPath + "MgmtSvc-TenantSite\\Content\\BillingTenant";
                    CopyFolder(webSiteSourcePath, webSiteDestPath);

                    //copy Manifest files
                    webSiteSourcePath = MainSourcePath + "WAPPortals\\TenantExtension\\Manifests";
                    webSiteDestPath = MainDestPath + "MgmtSvc-TenantSite\\Manifests";
                    CopyFolder(webSiteSourcePath, webSiteDestPath);

                    //copy Bin files
                    webSiteSourcePath = MainSourcePath + "WAPPortals\\TenantExtension\\bin\\Debug";
                    webSiteDestPath = MainDestPath + "MgmtSvc-TenantSite\\bin";
                    string includePrefix = "BCP.Billing";
                    CopyFolder(webSiteSourcePath, webSiteDestPath, includePrefix);

                    Environment.Output.WriteLine("Tenant portal deployed successfully.");
                }
            });
        }

        public void DeployAdvancedTenantPortal()
        {
            RetryDeploy(() =>
            {
                if (!Environment.skipTenantWeb)
                {
                    Environment.Output.WriteLine("Upload Tenant portal deployment starts.");

                    //List<string> tenantWebSiteComponents = GetTenantWebSiteComponents();
                    //List<string> webSiteExcludedComponents = GetWebSiteExcludedComponents();

                    //copy Content files
                    string webSiteSourcePath = MainSourcePath + "WAPPortals\\UploadExtension\\Content";
                    string webSiteDestPath = MainDestPath + "MgmtSvc-TenantSite\\Content\\UploadTenant";
                    CopyFolder(webSiteSourcePath, webSiteDestPath);

                    //copy Manifest files
                    webSiteSourcePath = MainSourcePath + "WAPPortals\\UploadExtension\\Manifests";
                    webSiteDestPath = MainDestPath + "MgmtSvc-TenantSite\\Manifests";
                    CopyFolder(webSiteSourcePath, webSiteDestPath);

                    //copy Bin files
                    webSiteSourcePath = MainSourcePath + "WAPPortals\\UploadExtension\\bin\\Debug";
                    webSiteDestPath = MainDestPath + "MgmtSvc-TenantSite\\bin";
                    string includePrefix = "BCP.Upload";
                    CopyFolder(webSiteSourcePath, webSiteDestPath, includePrefix);

                    Environment.Output.WriteLine("Upload Tenant portal deployed successfully.");
                }
            });
        }


        public void DeployAdvancedAdminPortal()
        {
            RetryDeploy(() =>
            {
                if (!Environment.skipTenantWeb)
                {
                    Environment.Output.WriteLine("Upload Admin portal deployment starts.");

                    //List<string> tenantWebSiteComponents = GetTenantWebSiteComponents();
                    //List<string> webSiteExcludedComponents = GetWebSiteExcludedComponents();

                    //copy Content files
                    string webSiteSourcePath = MainSourcePath + "WAPPortals\\AdminExtension\\Content";
                    string webSiteDestPath = MainDestPath + "MgmtSvc-AdminSite\\Content\\StorageAdmin";
                    CopyFolder(webSiteSourcePath, webSiteDestPath);

                    //copy Manifest files
                    webSiteSourcePath = MainSourcePath + "WAPPortals\\AdminExtension\\Manifests";
                    webSiteDestPath = MainDestPath + "MgmtSvc-AdminSite\\Manifests";
                    CopyFolder(webSiteSourcePath, webSiteDestPath);

                    //copy Bin files
                    webSiteSourcePath = MainSourcePath + "WAPPortals\\AdminExtension\\bin\\Debug";
                    webSiteDestPath = MainDestPath + "MgmtSvc-AdminSite\\bin";
                    string includePrefix = "BCP.Upload";
                    CopyFolder(webSiteSourcePath, webSiteDestPath, includePrefix);

                    Environment.Output.WriteLine("Upload Tenant portal deployed successfully.");
                }
            });
        }

        private List<string> GetWebSiteExcludedComponents()
        {
            List<string> excludeComponents = new List<string>();

            return excludeComponents;
        }



        public static void Compress(string directoryPath, string directorySelected)
        {
            ZipFile.CreateFromDirectory(directorySelected, directoryPath);

            //foreach (FileInfo fileToCompress in directorySelected.GetFiles())
            //{
            //    using (FileStream originalFileStream = fileToCompress.OpenRead())
            //    {
            //        if ((File.GetAttributes(fileToCompress.FullName) &
            //           FileAttributes.Hidden) != FileAttributes.Hidden & fileToCompress.Extension != ".gz")
            //        {
            //            using (FileStream compressedFileStream = File.Create(fileToCompress.FullName + ".gz"))
            //            {
            //                using (GZipStream compressionStream = new GZipStream(compressedFileStream,
            //                   CompressionMode.Compress))
            //                {
            //                    originalFileStream.CopyTo(compressionStream);

            //                }
            //            }
            //            FileInfo info = new FileInfo(directoryPath + "\\" + fileToCompress.Name + ".gz");
            //            Console.WriteLine("Compressed {0} from {1} to {2} bytes.",
            //            fileToCompress.Name, fileToCompress.Length.ToString(), info.Length.ToString());
            //        }

            //    }
            //}
        }
    }
}
