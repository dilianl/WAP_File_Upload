(function (global, undefined) {
    "use strict";

    var extensions = [{
        name: "BillingAdminExtension",        
        iconUri: "/Content/BillingAdmin/billing-icon.png",
        iconShowCount: false,
        iconTextOffset: 11,
        iconInvertTextColor: true,
        displayOrderHint: 410 // This describes where extension should show up in portal. It should start from 400.
    }];

    global.Shell.Internal.ExtensionProviders.addLocal(extensions);
})(this);