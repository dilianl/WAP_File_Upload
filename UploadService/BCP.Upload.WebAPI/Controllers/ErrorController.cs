using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Results;

namespace BCP.Billing.WebApi.Controllers
{
    public class ErrorController : ApiController
    {
        private static Logger logger = LogManager.GetLogger("NLogExceptionLogger");

        [HttpGet, HttpPost, HttpPut, HttpDelete, HttpHead, HttpOptions, AcceptVerbs("PATCH")]
        public NotFoundResult Handle404()
        {
            string message = String.Format("URI not matched: {0}{1}{2}", this.Request.RequestUri, Environment.NewLine, this.Request.Content.ReadAsStringAsync());
            logger.Log(LogLevel.Error, message);

            return NotFound();
        }
    }
}