(function (global, undefined) {
    "use strict";

    var extensions = [{
        name: "UploadTenantExtension",
        displayName: "Upload",
        iconUri: "/Content/UploadTenant/billing-icon.png",
        iconShowCount: false,
        iconTextOffset: 11,
        iconInvertTextColor: true,
        displayOrderHint: 3 // Display it right after WebSites extension (order 1)
    }];

    global.Shell.Internal.ExtensionProviders.addLocal(extensions);
})(this);