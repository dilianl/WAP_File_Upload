/*globals jQuery*/
/// <dictionary>
/// addon,addons
///</dictionary>
(function($, global, undefined) {
    "use strict";

    var linesContext = {}, rateCardContext = {};

    function findById(lineId, items) {
        var i;

        for (i = 0; i < items.length; i++) {
            if (items[i].id === lineId) {
                return items[i];
            }
        }

        return null;
    }

    function resolveLineFromContext() {
        var localDataSet;

        if (!linesContext.line && linesContext.navigatedLineId) {

            localDataSet = global.BillingAdminExtension.RateCardLinesTab.loadSubscriptionNavigationItems();
            linesContext.line = findById(linesContext.navigatedLineId, localDataSet.data);
        }

        // when navigating to a URI pasted in the browser (or F5 refresh), navigated subscription ID may not correspond to any of the loaded subscriptions
        // (note that subscription list may be virtualzed, so it's relatively easy to run into this)
        if (!linesContext.subscription) {
            return false;
        }

        return true;
    }

    function resolveRatCardFromContext() {
        var localDataSet;

        if (!rateCardContext.user && rateCardContext.navigatedUserId) {
            localDataSet = global.BillingAdminExtension.RateCardLinesTab.loadNavigationItems();
            rateCardContext.rateCard = findById(rateCardContext.navigatedRateCardId, localDataSet.data);
        }

        // when navigating to a URI pasted in the browser (or F5 refresh), navigated user ID may not correspond to any of the loaded users
        // (note that user list may be virtualzed, so it's relatively easy to run into this)
        if (!rateCardContext.user) {
            return false;
        }

        return true;
    }

    // public: Remember names of user/subscription extracted from the URI during navigation.
    function onNavigating(context) {
        var destinationItem = context.destination.item;

        linesContext = {};
        rateCardContext = {};

        if (destinationItem) {
            if (destinationItem.type === "TenantSubscription") {
                linesContext.navigatedLineId = context.destination.item.name;
            }

            if (destinationItem.type === "TenantAccount") {
                rateCardContext.navigatedRateCardId = context.destination.item.name;
            }
        }

        if (linesContext.navigatedLineId && !resolveLineFromContext() ||
            rateCardContext.navigatedRateCardId && !resolveRateCardFromContext()) {
            // Subscription doesn't exist anymore. Typically happens when a stale URI with deleted subscription is navigated to directly.
            context.redirect(Shell.UI.Navigation.calculateNavigationPath({
                extension: context.destination.extension,
                view: "rateCardListView"
            }));
        }
    }

    Shell.Namespace.define("BillingAdminExtension", {
        Navigation: {
            onNavigating: onNavigating
        }
    });
})(jQuery, this);                         // Ignore jslint