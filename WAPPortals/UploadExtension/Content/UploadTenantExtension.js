/*globals window,jQuery,Shell, BillingTenantExtension, Exp*/

(function ($, global, undefined) {
    "use strict";

    var resources = global.Resources.getResources("BCP.Upload.TenantExtension.UploadTenantResources"),
        UploadTenantExtensionActivationInit,
        navigation,
        serviceName = "Upload";

    function onNavigateAway() {
        Exp.UI.Commands.Contextual.clear();
        Exp.UI.Commands.Global.clear();
        Exp.UI.Commands.update();
    }

    function loadSettingsTab(extension, renderArea, renderData) {
        global.UploadTenantExtension.SettingsTab.loadTab(renderData, renderArea);
    }

    function uploadRecordsTab(extension, renderArea, renderData) {
        global.UploadTenantExtension.UploadRecordsTab.loadTab(renderData, renderArea);
    }

    function uploadCurrentTab(extension, renderArea, renderData) {
        global.UploadTenantExtension.UploadCurrentTab.loadTab(renderData, renderArea);
    }

    global.UploadTenantExtension = global.UploadTenantExtension || {};

    navigation = {
        tabs: [
            {
                id: "uploadRecords",
                displayName: "File Upload",
                template: "uploadRecordsTab",
                activated: uploadRecordsTab
            }//,
            //{
            //     id: "uploadCurrent",
            //     displayName: "Attach VHD",
            //     template: "uploadCurrentTab",
            //     activated: uploadCurrentTab
            //}
        ],
        types: [
        ]
    };

    UploadTenantExtensionActivationInit = function () {
        var subs = Exp.Rdfe.getSubscriptionList(),
            subscriptionRegisteredToService = global.Exp.Rdfe.getSubscriptionsRegisteredToService("Upload"),
            UploadExtension = $.extend(this, global.UploadTenantExtension);

        // Don't activate the extension if user doesn't have a plan that includes the service.
        if (subscriptionRegisteredToService.length === 0) {
            return false; // Don't want to activate? Just bail
        }

        $.extend(UploadExtension, {
            //viewModelUris: [BillingExtension.Controller.listBillingRecordsUrl],
            displayName: "Advanced",
            //navigationalViewModelUri: {
            //    uri:BillingExtension.Controller.listBillingRecordsUrl,
            //    ajaxData: function () {
            //        return global.Exp.Rdfe.getSubscriptionIdsRegisteredToService(serviceName);
            //    }
            //},
            displayStatus: global.waz.interaction.statusIconHelper(global.UploadTenantExtension.UploadRecordsTab.statusIcons, "Status"),
            menuItems: [
            ],
            getResources: function () {
                return resources;
            }
        });

        UploadExtension.onNavigateAway = onNavigateAway;
        UploadExtension.navigation = navigation;

        Shell.UI.Pivots.registerExtension(UploadExtension, function () {
            Exp.Navigation.initializePivots(this, this.navigation);
        });

        // Finally activate and give "the" BillingExtension the activated extension since a good bit of code depends on it
        $.extend(global.UploadTenantExtension, Shell.Extensions.activate(UploadExtension));
    };



    Shell.Namespace.define("UploadTenantExtension", {
        serviceName: serviceName,
        init: UploadTenantExtensionActivationInit
    });
})(jQuery, this);
