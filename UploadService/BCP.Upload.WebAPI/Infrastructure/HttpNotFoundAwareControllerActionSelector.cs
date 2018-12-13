using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace BCP.Upload.WebApi.Infrastructure
{
    public class HttpNotFoundAwareControllerActionSelector : ApiControllerActionSelector
    {
        private static Logger logger = LogManager.GetLogger("HttpNotFoundAwareControllerActionSelector");


        public HttpNotFoundAwareControllerActionSelector()
        {
        }

        public override HttpActionDescriptor SelectAction(HttpControllerContext controllerContext)
        {
            HttpActionDescriptor decriptor = null;
            try
            {
                decriptor = base.SelectAction(controllerContext);
            }
            catch (HttpResponseException ex)
            {

                var code = ex.Response.StatusCode;
                if (code == HttpStatusCode.NotFound || code == HttpStatusCode.MethodNotAllowed)
                {
                    string logMessage = "URI not matched [Action selection]: ";

                    if (controllerContext.Request.RequestUri != null)
                    {
                        logMessage += controllerContext.Request.RequestUri;
                    }

                    logger.Log(LogLevel.Error, logMessage, ex);

                }

                throw;
            }

            return decriptor;
        }
    }
}