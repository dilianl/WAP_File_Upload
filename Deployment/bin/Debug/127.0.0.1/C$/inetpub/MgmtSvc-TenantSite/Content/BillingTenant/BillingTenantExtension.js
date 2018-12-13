/*globals window,jQuery,Shell, BillingTenantExtension, Exp*/

(function ($, global, undefined) {
    "use strict";

    var resources = global.Resources.getResources("BCP.Billing.TenantExtension.BillingTenantResources"),
        BillingTenantExtensionActivationInit,
        navigation,
        serviceName = "Billing";

    function onNavigateAway() {
        Exp.UI.Commands.Contextual.clear();
        Exp.UI.Commands.Global.clear();
        Exp.UI.Commands.update();
    }

    function loadSettingsTab(extension, renderArea, renderData) {
        global.BillingTenantExtension.SettingsTab.loadTab(renderData, renderArea);
    }

    function billingRecordsTab(extension, renderArea, renderData) {
        global.BillingTenantExtension.BillingRecordsTab.loadTab(renderData, renderArea);
    }

    function billingCurrentTab(extension, renderArea, renderData) {
        global.BillingTenantExtension.BillingCurrentTab.loadTab(renderData, renderArea);
    }

    global.BillingTenantExtension = global.BillingTenantExtension || {};

    navigation = {
        tabs: [
            {
                id: "billingRecords",
                displayName: "Billing",
                template: "billingRecordsTab",
                activated: billingRecordsTab
            },
            {
                 id: "billingCurrent",
                 displayName: "Usage current",
                 template: "billingCurrentTab",
                 activated: billingCurrentTab
            }
        ],
        types: [
        ]
    };

    BillingTenantExtensionActivationInit = function () {
        var subs = Exp.Rdfe.getSubscriptionList(),
            subscriptionRegisteredToService = global.Exp.Rdfe.getSubscriptionsRegisteredToService("Billing"),
            BillingExtension = $.extend(this, global.BillingTenantExtension);

        // Don't activate the extension if user doesn't have a plan that includes the service.
        if (subscriptionRegisteredToService.length === 0) {
            return false; // Don't want to activate? Just bail
        }

        $.extend(BillingExtension, {
            //viewModelUris: [BillingExtension.Controller.listBillingRecordsUrl],
            displayName: "Billing Information",
            //navigationalViewModelUri: {
            //    uri:BillingExtension.Controller.listBillingRecordsUrl,
            //    ajaxData: function () {
            //        return global.Exp.Rdfe.getSubscriptionIdsRegisteredToService(serviceName);
            //    }
            //},
            displayStatus: global.waz.interaction.statusIconHelper(global.BillingTenantExtension.BillingRecordsTab.statusIcons, "Status"),
            menuItems: [
            ],
            getResources: function () {
                return resources;
            }
        });

        BillingExtension.onNavigateAway = onNavigateAway;
        BillingExtension.navigation = navigation;

        Shell.UI.Pivots.registerExtension(BillingExtension, function () {
            Exp.Navigation.initializePivots(this, this.navigation);
        });

        // Finally activate and give "the" BillingExtension the activated extension since a good bit of code depends on it
        $.extend(global.BillingTenantExtension, Shell.Extensions.activate(BillingExtension));
    };



    Shell.Namespace.define("BillingTenantExtension", {
        serviceName: serviceName,
        init: BillingTenantExtensionActivationInit
    });
})(jQuery, this);
