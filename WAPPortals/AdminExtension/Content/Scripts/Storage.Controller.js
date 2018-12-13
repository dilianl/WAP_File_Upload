/*globals window,jQuery,cdm, StorageSampleAdminExtension*/
(function ($, global, shell, exp, undefined) {
    "use strict";

    var baseUrl = "/StorageAdmin",
        adminSettingsUrl = baseUrl + "/AdminSettings",
        adminProductsUrl = baseUrl + "/Products",
        adminFileServersUrl = baseUrl + "/FileServers",
        adminSharesUrl = baseUrl + "/Shares",
        adminShareCreateUrl = baseUrl + "/CreateShare",
        getAllUsersUrl = baseUrl + "/GetAllUsers",
        deleteSharedUrl = baseUrl + "/DeleteShare";

    function makeAjaxCall(url, data) {
        return Shell.Net.ajaxPost({
            url: url,
            data: data
        });
    }

    function deleteShare(selectedId) {
        return makeAjaxCall(deleteSharedUrl, { id: selectedId });
    }

    function getAllUsers() {
        return makeAjaxCall(getAllUsersUrl);
    }

    function updateAdminSettings(newSettings) {
        return makeAjaxCall(baseUrl + "/UpdateAdminSettings", newSettings);
    }

    function invalidateAdminSettingsCache() {
        return global.Exp.Data.getData({
            url: global.StorageAdminExtension.Controller.adminSettingsUrl,
            dataSetName: StorageAdminExtension.Controller.adminSettingsUrl,
            forceCacheRefresh: true
        });
    }

    function getCurrentAdminSettings() {
        return makeAjaxCall(global.StorageAdminExtension.Controller.adminSettingsUrl);
    }

    function isResourceProviderRegistered() {
        global.Shell.UI.Spinner.show();
        global.StorageAdminExtension.Controller.getCurrentAdminSettings()
        .done(function (response) {
            if (response && response.data.EndpointAddress) {
                return true;
            }
            else {
                return false;
            }
        })
         .always(function () {
             global.Shell.UI.Spinner.hide();
         });
    }

    function getSharesDataSetInfo() {
        return {
            url: adminSharesUrl,
            dataSetName: adminSharesUrl
        };
    }

    // Public
    global.StorageAdminExtension = global.StorageAdminExtension || {};
    global.StorageAdminExtension.Controller = {
        adminSettingsUrl: adminSettingsUrl,
        adminProductsUrl: adminProductsUrl,
        adminFileServersUrl: adminFileServersUrl,
        adminSharesUrl: adminSharesUrl,
        adminShareCreateUrl: adminShareCreateUrl,
        updateAdminSettings: updateAdminSettings,
        deleteShare: deleteShare,
        getAllUsers: getAllUsers,
        getCurrentAdminSettings: getCurrentAdminSettings,
        invalidateAdminSettingsCache: invalidateAdminSettingsCache,
        isResourceProviderRegistered: isResourceProviderRegistered,
        getSharesDataSetInfo: getSharesDataSetInfo,
        makeAjaxCall: makeAjaxCall
    };
})(jQuery, this, Shell, Exp);
