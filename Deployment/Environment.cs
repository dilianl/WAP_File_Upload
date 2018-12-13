using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Management;
using System.Text;
using System.Threading.Tasks;

namespace Deployment
{
    public abstract class Environment
    {

        #region command line config
        //public static List<string> cmdArgs { get; set; }
        //public static bool skipBuild { get; set; }
        //public static bool skipEmail1 { get; set; }

        public static bool skipTenantWeb { get; set; }
        public static bool skipWapService { get; set; }
        public static bool skipAdminsWeb { get; set; }
       

        public static int retryDeploy { get; set; }
        public static int stopSleep = 500;
        public static int startSleep = 5000;
        public static int startTimeout = 80000;

        public static bool CreateAutoBuildWorkspace { get; set; }
        public static bool DropAutoBuildWorkspace { get; set; }
        #endregion

        public static OutputWriter Output = new OutputWriter();


        protected string MainSourcePath { get; set; }
        protected string IPAddress { get; set; }
        protected string MainDestPath { get; set; }
        protected string DestDirZip { get; set; }
        protected string SoruceDirZip { get; set; }
        protected bool CreateBackup { get; set; }
        public DestinationServer Destination { get; set; }

        public Environment()
        {
            IPAddress = ConfigurationManager.AppSettings["ServerIPAddress"] + "\\C$";
            MainSourcePath = ConfigurationManager.AppSettings["MainSourcePath"];
            MainDestPath = /*IPAddress +*/ ConfigurationManager.AppSettings["Destination"];

            SoruceDirZip = /*IPAddress +*/ ConfigurationManager.AppSettings["SoruceDirZip"];
            DestDirZip = /*IPAddress +*/ ConfigurationManager.AppSettings["DestDirZip"];
            CreateBackup = ConfigurationManager.AppSettings["CreateBackup"] == "1" ? true:false;
            //int destinationInt;
            //string destinationConfig = ConfigurationManager.AppSettings["Destination"];
            //if (Int32.TryParse(destinationConfig, out destinationInt))
            //{
            //    Destination = (DestinationServer)destinationInt;
            //}

        }

        protected void RetryDeploy(Action operation, int retry = 0)
        {
            try
            {
                operation();
            }
            catch (Exception ex)
            {
                if (retry < Environment.retryDeploy)
                    RetryDeploy(operation, ++retry);
                else
                    throw ex;
            }
        }

        //protected void DeployService(string ipAddress, string serviceName, string sourcePath, string destPath, int stopServiceDelayMSec = 500)
        //{
        //    if (stopServiceDelayMSec == 500)
        //        stopServiceDelayMSec = Environment.stopSleep;

        //    RetryDeploy(() =>
        //    {
        //        if (string.IsNullOrEmpty(ipAddress))
        //            return;//skip deployment if not set in the config


        //        Service service = new Service(ipAddress, serviceName, stopServiceDelayMSec);

        //        Environment.Output.WriteLine(serviceName + " deployment starts.");

        //        service.StopService();

        //        bool filesCopySuccess = false;

        //        // wait for service stop
        //        int startTimeout = 0;
        //        while (!filesCopySuccess)
        //        {
        //            try
        //            {
        //                CopyFolder(sourcePath, destPath);

        //                filesCopySuccess = true;
        //            }
        //            catch
        //            {
        //                System.Threading.Thread.Sleep(stopServiceDelayMSec);
        //            }


        //            startTimeout += stopServiceDelayMSec;
        //            if (startTimeout >= Environment.startTimeout)
        //            {
        //                throw new Exception(String.Format("Service {0} cannot be stopped.", serviceName));
        //            }
        //        }


        //        service.StartService();

        //        Environment.Output.WriteLine(serviceName + " deployed successfully.");
        //    });
        //}


        protected void CopyFolder(string sourceFolder, string destFolder, string containPrefix = "", List<string> excludeFileFolder = null)
        {
            if (!Directory.Exists(destFolder))
            {
                Directory.CreateDirectory(destFolder);
            }

            string[] files = Directory.GetFiles(sourceFolder);

            var po = new ParallelOptions
            {
                MaxDegreeOfParallelism = System.Environment.ProcessorCount
            };


            Parallel.ForEach(files, po, file =>
            {
                string name = Path.GetFileName(file);
                bool excludeFile = excludeFileFolder == null ? false : excludeFileFolder.Any(ef => name.ToLowerInvariant().Contains(ef.ToLowerInvariant()));
                bool includeFile = containPrefix == string.Empty ? true : name.ToLowerInvariant().Contains(containPrefix.ToLowerInvariant());

                if (name != "NLog.config" & name != "NLog.dll" && name != "NLog.xml" && !excludeFile && includeFile)
                {
                    string dest = Path.Combine(destFolder, name);
                    File.Copy(file, dest, true);
                }
            });



            string[] folders = Directory.GetDirectories(sourceFolder);
            Parallel.ForEach(folders, po, folder =>
            {
                string name = Path.GetFileName(folder);
                bool excluded = excludeFileFolder == null ? false : excludeFileFolder.Contains(name);
                bool include = containPrefix == string.Empty ? true : name.ToLowerInvariant().Contains(containPrefix.ToLowerInvariant());

                if (name != "NLog.config" && name != "NLog.dll" && name != "NLog.xml" &&  !excluded && include)
                {
                    string dest = Path.Combine(destFolder, name);
                    CopyFolder(folder, dest, containPrefix, excludeFileFolder);
                }
            });
        }

        public enum DestinationServer
        {
            Test = 1,
            Staging = 2
        }
    }
}
