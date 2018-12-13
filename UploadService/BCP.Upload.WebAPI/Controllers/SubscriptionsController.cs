//------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
//------------------------------------------------------------
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web.Http;
using BCP.Upload.Common;

namespace BCP.Billing.WebApi.Controllers
{
    /// <summary>
    /// Subscriptions Controller class
    /// </summary>
    public class SubscriptionsController : ApiController
    {
        public static List<Subscription> subscriptions = new List<Subscription>();

        /// <summary>
        /// Gets a subscription collection.
        /// </summary>
        [HttpGet]
        public List<Subscription> GetSubscriptionList()
        {
            return subscriptions;
        }

        /// <summary>
        /// Updates the subscription. Like suspend/activate 
        /// </summary>
        /// <param name="subscription">The subscription.</param>
        [HttpPut]
        public Subscription UpdateSubscription(Subscription subscription)
        {
            this.ValidateSubscriptionId(subscription);

            var sub = (from s in subscriptions where s.SubscriptionId == subscription.SubscriptionId select s).FirstOrDefault();

            if (sub != null)
            {
                sub.AdminId = subscription.AdminId;
                sub.SubscriptionName = subscription.SubscriptionName;
                sub.CoAdminIds = subscription.CoAdminIds;
            }

            // You can also throw exception if for some reason update subscription violates any business rules.
            // In that case subscription will go out of sync. So ensure your exception having enough information to admin/provider can take decision to fix issue.
            // Admin can issue sync command which will call UpdateSubscription
            return subscription;
        }

        /// <summary>
        /// Creates the subscription.
        /// </summary>
        /// <param name="subscription">The subscription.</param>
        [HttpPost]
        public Subscription AddSubscription(Subscription subscription)
        {
            this.ValidateSubscriptionId(subscription);

            // Add subscription to in memory collection of subscriptions
            // Actual resource provider can save this in their backend store
            subscriptions.Add(new Subscription
            {
                SubscriptionId = subscription.SubscriptionId,
                SubscriptionName = subscription.SubscriptionName,
                AdminId = subscription.AdminId,
                CoAdminIds = subscription.CoAdminIds
            });

            // You can also throw exception if for some reason update subscription voilates any business rules.
            // In that case subscription will go out of sync. So ensure your exception having enough information to admin/provider can take decision to fix issue.
            // Admin can issue sync command which will call UpdateSubscription
            return subscription;
        }

        /// <summary>
        /// Deletes the subscription.
        /// </summary>
        /// <param name="subscriptionId">The subscription id.</param>
        [HttpDelete]
        public void DeleteSubscription(string subscriptionId)
        {
            this.ValidateSubscriptionId(subscriptionId);

            var sub = subscriptions.FirstOrDefault(x => x.SubscriptionId == subscriptionId);

            if (sub != null)
            {
                subscriptions.Remove(sub);
            }
        }

        /// <summary>
        /// Validates the subscription id.
        /// </summary>
        /// <param name="subscriptionId">The subscription id.</param>
        /// <returns>Subscription Guid</returns>
        private void ValidateSubscriptionId(Subscription subscription)
        {
            //if (subscription == null || string.IsNullOrWhiteSpace(subscription.SubscriptionId))
            //{
            //    throw ResponseExceptionHelper.ThrowResponseException(this.Request, System.Net.HttpStatusCode.BadRequest, ErrorMessages.EmptySubscription);
            //}

            Guid id;
            bool parseGuid = Guid.TryParse(subscription.SubscriptionId, out id);

            //if (!parseGuid)
            //{
            //    string message = string.Format(CultureInfo.CurrentCulture, ErrorMessages.InvalidSubscriptionFormat, subscription.SubscriptionId);
            //    throw ResponseExceptionHelper.ThrowResponseException(this.Request, System.Net.HttpStatusCode.BadRequest, message);
            //}
        }

        /// <summary>
        /// Validates the subscription id.
        /// </summary>
        /// <param name="subscriptionId">The subscription id.</param>
        /// <returns>Subscription Guid</returns>
        private void ValidateSubscriptionId(string subscriptionId)
        {
            //if (string.IsNullOrWhiteSpace(subscriptionId))
            //{
            //    throw ResponseExceptionHelper.ThrowResponseException(this.Request, System.Net.HttpStatusCode.BadRequest, ErrorMessages.EmptySubscription);
            //}

            Guid id;
            bool parseGuid = Guid.TryParse(subscriptionId, out id);

            //if (!parseGuid)
            //{
            //    string message = string.Format(CultureInfo.CurrentCulture, ErrorMessages.InvalidSubscriptionFormat, subscriptionId);
            //    throw ResponseExceptionHelper.ThrowResponseException(this.Request, System.Net.HttpStatusCode.BadRequest, message);
            //}
        }
    }
}
