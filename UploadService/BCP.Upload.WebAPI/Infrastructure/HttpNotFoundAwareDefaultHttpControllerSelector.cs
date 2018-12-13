using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Dispatcher;

namespace BCP.Upload.WebApi.Infrastructure
{
    public class HttpNotFoundAwareDefaultHttpControllerSelector : DefaultHttpControllerSelector
    {
        private static Logger logger = LogManager.GetLogger("HttpNotFoundAwareDefaultHttpControllerSelector");

        public HttpNotFoundAwareDefaultHttpControllerSelector(HttpConfiguration configuration)
            : base(configuration)
        {
        }
        public override HttpControllerDescriptor SelectController(HttpRequestMessage request)
        {
            HttpControllerDescriptor decriptor = null;
            try
            {
                decriptor = base.SelectController(request);
            }
            catch (HttpResponseException ex)
            {
                var code = ex.Response.StatusCode;
                if (code == HttpStatusCode.NotFound)
                {
                    string logMessage = "URI not matched [Controller selection]: ";

                    if (request.RequestUri != null)
                    {
                        logMessage += request.RequestUri;
                    }

                    logger.Log(LogLevel.Error, logMessage, ex);
                }

                throw;

            }
            return decriptor;
        }
    }
}