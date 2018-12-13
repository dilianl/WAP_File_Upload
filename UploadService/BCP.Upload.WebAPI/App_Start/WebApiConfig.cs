using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

using BCP.Upload.Data;
using System.Web.Http.ExceptionHandling;
using BCP.Upload.WebApi.Audit.Logging;
using System.Web.Http.Dispatcher;
using System.Web.Http.Controllers;
using BCP.Upload.WebApi.Infrastructure;

namespace BCP.Upload.WebApi
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services
            config.Services.Add(typeof(IExceptionLogger), new NLogExceptionLogger());
            config.Services.Replace(typeof(IHttpControllerSelector), new HttpNotFoundAwareDefaultHttpControllerSelector(config));
            config.Services.Replace(typeof(IHttpActionSelector), new HttpNotFoundAwareControllerActionSelector());

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "ExecuteRunbook",
                routeTemplate: "subscriptions/{subscriptionId}/executerunbook",
                defaults: new { controller = "VirtualMachine" });


            //config.Routes.MapHttpRoute(
            //    name: "BillingRecords",
            //    routeTemplate: "subscriptions/{subscriptionId}/billingrecords",
            //    defaults: new { controller = "Billing" });

            config.Routes.MapHttpRoute(
                name: "UploadRecords",
                routeTemplate: "subscriptions/{subscriptionId}/{action}",
                defaults: new { controller = "Upload" });

            config.Routes.MapHttpRoute(
                name: "ActionAPI",
                routeTemplate: "subscriptions/{subscriptionId}/{action}/{id}",
                defaults: new { controller = "Upload" });

            //config.Routes.MapHttpRoute(
            //    name: "BillingDetailedRecords",
            //    routeTemplate: "subscriptions/{subscriptionId}/billingcurrentrecords",
            //    defaults: new { controller = "Billing" });

            config.Routes.MapHttpRoute(
               name: "AdminShares",
               routeTemplate: "admin/shares/{action}",
               defaults: new { controller = "Shares" });

            config.Routes.MapHttpRoute(
               name: "AdminSharesAPI",
               routeTemplate: "admin/shares/{action}/{id}",
               defaults: new { controller = "Shares" });
            
            config.Routes.MapHttpRoute(
                name: "AdminSettings",
                routeTemplate: "admin/settings",
                defaults: new { controller = "AdminSettings" });

            config.Routes.MapHttpRoute(
               name: "AdminBilling",
               routeTemplate: "admin/billing/{action}",
               defaults: new { controller = "Billing" });


            config.Routes.MapHttpRoute(
                name: "CloudSliderQuota",
                routeTemplate: "admin/quota",
                defaults: new { controller = "Quota" });


            config.Routes.MapHttpRoute(
                name: "CloudSliderDefaultQuota",
                routeTemplate: "admin/defaultquota",
                defaults: new { controller = "Quota" });


            config.Routes.MapHttpRoute(
                name: "Subscription",
                routeTemplate: "admin/subscriptions",
                defaults: new { controller = "Subscriptions" });

            //LAST ROUTE CATCH ALL
            config.Routes.MapHttpRoute(
                name: "Error404",
                routeTemplate: "{*url}",
                defaults: new { controller = "Error", action = "Handle404" }
            );

        }
    }
}
