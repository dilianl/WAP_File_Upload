(function (global, undefined) {
    "use strict";

    var extensions = [{
        name: "StorageAdminExtension",
        displayName: "Storage",
        iconUri: "/Content/StorageAdmin/StorageAdmin.png",
        iconShowCount: false,
        iconTextOffset: 11,
        iconInvertTextColor: true,
        displayOrderHint: 51
    }];

    global.Shell.Internal.ExtensionProviders.addLocal(extensions);
})(this);
