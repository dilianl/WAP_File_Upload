using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http.ExceptionHandling;

namespace BCP.Upload.WebApi.Audit.Logging
{
    public class NLogExceptionLogger : ExceptionLogger
    {
        private static Logger logger = LogManager.GetLogger("NLogExceptionLogger");
        public override void Log(ExceptionLoggerContext context)
        {
            String exceptionString = RequestToString(context.Request);

            logger.Log(LogLevel.Error, context.Exception, exceptionString);
        }

        private static string RequestToString(HttpRequestMessage request)
        {
            var message = new StringBuilder();
            if (request.Method != null)
            {
                message.Append(request.Method);
            }


            if (request.RequestUri != null)
            {
                message.Append(" ").Append(request.RequestUri);
                message.Append(Environment.NewLine).Append(request.Content.ReadAsStringAsync());
            }

            return message.ToString();
        }
    }
}