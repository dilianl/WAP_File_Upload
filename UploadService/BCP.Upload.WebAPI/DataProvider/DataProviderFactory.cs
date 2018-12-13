
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BCP.Upload.WebApi.DataProvider
{
    /// <summary>
    /// Writing the data provider through a factory, so that we can switch to SQL data provider later easily.
    /// </summary>
    public class DataProviderFactory
    {
        public static IShareProvider ShareInstance
        {
            get { return InDataBaseShareProvider.Instance; }
        }
    }
}
