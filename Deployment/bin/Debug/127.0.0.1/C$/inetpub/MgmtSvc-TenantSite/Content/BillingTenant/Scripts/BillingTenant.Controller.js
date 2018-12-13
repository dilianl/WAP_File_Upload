/*globals window,jQuery,cdm,BillingTenantExtension,waz,Exp*/
(function ($, global, undefined) {
    "use strict";

    var baseUrl = "/BillingTenant",
        listBillingRecordsUrl = baseUrl + "/ListBillingRecords",
        listCurrentBillingRecordsUrl = baseUrl + "/ListCurrentBillingRecords",
        downloadBillingRecordsUrl = baseUrl + "/DownloadBillingRecords",
        domainType = "Billing";

    function navigateToListView() {
        Shell.UI.Navigation.navigate("#Workspaces/{0}/Billing".format(BillingTenantExtension.name));
    }

    function downloadBillingRecords(subId, billingMonth, billingYear) {
        var url = "{0}?subscriptionId={1}&billingMonth={2}&billingYear={3}".format(downloadBillingRecordsUrl, subId, billingMonth, billingYear);

        global.Exp.Utilities.download(url)
                     .fail(function (response) {
                         console.error("could not download the file from the provided url");
                     });
      
    }

    function getBillingRecords(data) {
        return makeAjaxCall(listBillingRecordsUrl, data);
    }

    function getBillingCurrentDetailedRecords(data) {
        return makeAjaxCall(listCurrentBillingRecordsUrl, data);
    }

    function makeAjaxCall(url, data) {
        return Shell.Net.ajaxPost({
            url: url,
            data: data
        });
    }

    function getBillingRecordsData(subscriptionId) {
        return Exp.Data.getData("billingrecord{0}".format(subscriptionId), {
            ajaxData: {
                subscriptionIds: subscriptionId
            },
            url: listBillingRecordsUrl,
            forceCacheRefresh: true
        });
    }



    global.BillingTenantExtension = global.BillingTenantExtension || {};
    global.BillingTenantExtension.Controller = {
        listBillingRecordsUrl: listBillingRecordsUrl,
        downloadBillingRecords: downloadBillingRecords,
        getBillingCurrentDetailedRecords: getBillingCurrentDetailedRecords,
        getBillingRecords: getBillingRecords,
        getBillingRecordsData: getBillingRecordsData,
        navigateToListView: navigateToListView
    };
})(jQuery, this);
