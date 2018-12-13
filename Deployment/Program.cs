using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Deployment
{
    class Program
    {
        static void Main(string[] args)
        {
            Environment.Output.WriteLineEvent += Console.Out.WriteLine;
            Environment.Output.WriteEvent += Console.Out.Write;

            WapEnvironment wap = new WapEnvironment();
            Environment.Output.WriteLine("DEPLOYMENT OF ADVANCED ENVIRONMENT");            
            wap.DeployWapUploadService();
            Environment.Output.WriteLine("---------------------------------------");
            wap.DeployAdvancedTenantPortal();
            Environment.Output.WriteLine("---------------------------------------");
            wap.DeployAdvancedAdminPortal();
            Environment.Output.WriteLine("---------------------------------------");
            Environment.Output.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
    }
}
