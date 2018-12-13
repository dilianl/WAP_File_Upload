/*globals window,jQuery,cdm, BillingAdminExtension*/
(function ($, global, undefined) {
    "use strict";

    var baseUrl = "/BillingAdmin",
        adminSettingsUrl = baseUrl + "/AdminSettings",
        configurationBaseUrl = "Configuration",
        rateCardsUrl = baseUrl + "/RateCards",
        setDefaultRateCardsUrl = baseUrl + "/SetRateCardDefaultForCurrency",

        rateCardLinesUrl = baseUrl + "/RateCardLines",
        rateCardGetLinesUrl = baseUrl + "/GetRateCardLines",
        rateCardDeleteLineUrl = baseUrl + "/DeleteRateCardLine",

        resourceTypes = baseUrl + "/GetResourceTypes",
    downloadBillingRecordsUrl = baseUrl + "/DownloadDetailedBillinInfo",
    downloadAnnualBillingRecordsUrl = baseUrl + "/DownloadAnnualDetailedBillinInfo";

    var grid, columns, icons, localDataSet;

    function makeAjaxCall(url, data) {
        return Shell.Net.ajaxPost({
            url: url,
            data: data
        });
    }

    function getResourceTypes() {
       return Shell.Net.post({
            url: resourceTypes,
            data: {},
            async: false
        }).done(function (response) {
            //return response.data;

        }).fail(function (jqXHR, textStatus, errorThrown) {
            var message = JSON.parse(jqXHR.responseText).message;
            alert(message);
        });
    }

    function getRateCard(subscriptionId, planFriendlyName) {
        return Shell.Net.ajaxPost({
            url: baseUrl + "/GetRateCard",
            data: {
                subscriptionId: subscriptionId
            }
        }).done(function (response) {
            Shell.UI.Notifications.add("Rate Card '{0}' is assigned to subscription '{1}'".format(response.data.Name, subscriptionId), Shell.UI.InteractionSeverity.information);
            onViewInfo(subscriptionId, response.data, planFriendlyName);

        }).fail(function (jqXHR, textStatus, errorThrown) {
            var message = JSON.parse(jqXHR.responseText).message;

            alert(message);
        });
    }

    function getBillingInfo(subscriptionId, plan) {

        return Shell.Net.ajaxPost({
            url: baseUrl + "/GetCurrentBillinInfo",
            data: {
                subscriptionId: subscriptionId
            }
        }).done(function (response) {
            onViewBillingInfo(subscriptionId, plan, response.data);

        }).fail(function (jqXHR, textStatus, errorThrown) {
            var message = JSON.parse(jqXHR.responseText).message;

            alert(message);
        });
    }

    function downloadBillingInfo(subscriptionId, plan) {

        var downloadillingInfoStep = {
            template: "downloadBillingInfo",
            data: {
                subscriptionId: subscriptionId,
                plan: plan
            },
            onStepActivate: function () {


                $('#subscriptionId').text('{0} ({1})'.format(subscriptionId, plan));
                $('#download').on("click", function () {
                    var year = $('#year').val();
                    var month = $('#month').val();

                    if (year > 0 && month > 0) {
                        downloadBillingRecords(subscriptionId, year, month);
                    } else if (year > 0) {
                        downloadAnnualBillingRecords(subscriptionId, year);
                    }
                });
            },
            onNextStep: function () {
                cleanup();
            }
        };

        var wizard = {
            extension: "BillingAdminExtension",
            steps: [downloadillingInfoStep],

            onComplete: function () {

            }
        };

        global.cdm.stepWizard(wizard, { size: "small" });
    }

    function downloadBillingRecords(subId, year, month) {
        var url = "{0}?subscriptionId={1}&year={2}&month={3}".format(downloadBillingRecordsUrl, subId, year, month);

        global.Exp.Utilities.download(url)
                     .fail(function (response) {
                         console.error("could not download the file from the provided url");
                     });

    }
    function downloadAnnualBillingRecords(subId, year) {
        var url = "{0}?subscriptionId={1}&year={2}".format(downloadAnnualBillingRecordsUrl, subId, year);

        global.Exp.Utilities.download(url)
                     .fail(function (response) {
                         console.error("could not download the file from the provided url");
                     });

    }

    function onDownloadBillingInfo(subscriptionId, plan) {
        downloadBillingInfo(subscriptionId, plan);
    }

    function formatBillingPrice(value, rowNumber, columnNumber, rowDefinition) {
        var dataContext = rowNumber.dataItem;
       
        return "{0}{1}/{2}".format(dataContext.Currency, value, dataContext.UnitOfMeasurement);
    }

    function numberFormat(val, decimalPlaces) {
        if (val == "NAN" || val == null) return "-";
        var multiplier = Math.pow(10, decimalPlaces);
        return (Math.round(val * multiplier) / multiplier).toFixed(decimalPlaces);
    }

    function formatCost(value, rowNumber, columnNumber, rowDefinition) {
        var dataContext = rowNumber.dataItem;

        return "{0} {1}".format(dataContext.Currency, numberFormat(value, 2));
    }

    function formatDecimal(value, rowNumber, columnNumber, rowDefinition) {
        var dataContext = rowNumber.dataItem;

        return "{0}".format( numberFormat(value, 2));
    }

    function onViewBillingInfo(subscriptionId, plan, data) {

        columns = [
              { name: "Resourse Name", field: "Vm", filterable: false, sortable: true },
              { name: "Period From", field: "PeriodFrom", formatter: $.fxGridFormatter.date("G"), filterable: false, sortable: false },
              { name: "Period To", field: "PeriodTo", formatter: $.fxGridFormatter.date("G"), filterable: false, sortable: false },
              { name: "vCPUs", field: "Cores", formatter: formatDecimal, filterable: false, sortable: true },
              { name: "Memory (GB)", field: "Memory", formatter: formatDecimal, filterable: false, sortable: true },
              { name: "DiskSpace (GB)", field: "DiskSpace", formatter: formatDecimal, filterable: false, sortable: true },
              { name: "Hours (Machine running)", field: "ComputeUsage", formatter: formatDecimal, filterable: false, sortable: true },
              { name: "Hours Total", field: "StorageUsage", formatter: formatDecimal, filterable: false, sortable: true },
              { name: "Price Compute", field: "ComputePrice", formatter: formatCost, filterable: false, sortable: true },
              { name: "Price Storage", field: "StoragePrice", formatter: formatCost, filterable: false, sortable: true },
              { name: "VM Price", field: "Cost", formatter: formatCost, filterable: false, sortable: true }
        ];
          
        icons = {
            "false": { url: "/Content/Images/icon-validation-valid.gif", text: "Active" },
            "true": { url: "/Content/Images/icon-help.png", text: "Inactive" }
        };
        var viewBillingInfoStep = {
            template: "viewBillingInfo",
            data: {
                subscriptionId: subscriptionId,
                plan: plan
            },
            onStepActivate: function () {

                var currentTime = new Date();

                $('#totalCost').text("Total Cost: {0} {1}".format(data.Currency, data.TotalCost));
                $('#download').on("click", function () {

                    downloadBillingRecords(subscriptionId, currentTime.getFullYear(), currentTime.getMonth() + 1);

                });

                //assign responseText to localDataSet variable
                localDataSet = data.BillingRecords;

                //display empty template if no records are fetched
                if (localDataSet.length > 0) {

                    //call grid once the data is fetched
                    grid = $(".gridContainerCurrent")
                    .wazObservableGrid("destroy")
                    .wazObservableGrid({
                        lastSelectedRow: null,
                        data: localDataSet,
                        keyField: "id",
                        columns: columns,
                        fastPollingOnDataSet: false,
                        gridOptions: {
                            pagerOptions: {
                                pageSize: 10
                            },
                        }
                    });
                }
                else {
                    //$(".gridContainerCurrent").html(global.BillingTenantExtension.templates.billingRecordsTabEmpty.render(resources));
                }

            },
            onNextStep: function () {
                cleanup();
                //// Prevents the flow to proceed unless the user's input is 100% accurate
                //return Shell.UI.Validation.validateContainer(valContainerSelector);
            }
        };

        var wizard = {
            extension: "BillingAdminExtension",
            steps: [viewBillingInfoStep],

            onComplete: function () {
                cleanup();
            }
        };

        global.cdm.stepWizard(wizard, { size: "large" });
    }

    function cleanup() {
        if (grid) {
            grid.wazObservableGrid("destroy");
            grid = null;
        }
    }

    function onViewInfo(subscriptionId, item, planFriendlyName) {
        var viewRateCardStep = {
            template: "viewRateCard",
            data: {
                RateCardName: item.Name,
                SubscriptionId: subscriptionId,
                item: item,
                planFriendlyName: planFriendlyName,
                createdOn: new Date(Date.parse(item.CreatedOn)),
                status: item.Inactive ? "Inactive" : "Active"
            },
            onStepActivate: function () {

            },
            onNextStep: function () {
                //// Prevents the flow to proceed unless the user's input is 100% accurate
                //return Shell.UI.Validation.validateContainer(valContainerSelector);
            }
        };

        var wizard = {
            extension: "BillingAdminExtension",
            steps: [viewRateCardStep],

            onComplete: function () {
            }
        };

        global.cdm.stepWizard(wizard, { size: "small" });
    }

    function updateAdminSettings(newSettings) {
        return makeAjaxCall(baseUrl + "/UpdateAdminSettings", newSettings);
    }

    function invalidateAdminSettingsCache() {
        return global.Exp.Data.getData({
            url: global.BillingAdminExtension.Controller.adminSettingsUrl,
            dataSetName: BillingAdminExtension.Controller.adminSettingsUrl,
            forceCacheRefresh: true
        });
    }

    function getCurrentAdminSettings() {
        return makeAjaxCall(global.BillingAdminExtension.Controller.adminSettingsUrl);
    }

    function isResourceProviderRegistered() {
        global.Shell.UI.Spinner.show();
        global.BillingAdminExtension.Controller.getCurrentAdminSettings()
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


    function getRateCardItemsDataSetInfo(rateCardId) {
        if (rateCardId) {
            return {
                dataSetName: rateCardLinesUrl,
                url: rateCardLinesUrl + "?rateCardId=" + rateCardId
            };
        }
        return {
            dataSetName: rateCardLinesUrl,
            url: rateCardLinesUrl
        };
    }

    function setDefaultRateCardForCurrency(rateCardId, currency) {

        return makeAjaxCall(setDefaultRateCardsUrl, { rateCardId: rateCardId, currency: currency });
    }

    function getRateCardItems(data) {
        return makeAjaxCall(rateCardLinesUrl, data);
    }

    function getRateCardsDataSetInfo() {
        return {
            dataSetName: rateCardsUrl,
            url: rateCardsUrl
        };
    }

    function deleteRateCardLineItem(rateCardLineItemId, rateCardId) {
        return Shell.Net.ajaxPost({
            url: rateCardDeleteLineUrl,
            data: {
                rateCardLineId: rateCardLineItemId,
                rateCardId: rateCardId
            }
        });
    }

    // Public
    global.BillingAdminExtension = global.BillingAdminExtension || {};
    global.BillingAdminExtension.Controller = {
        adminSettingsUrl: adminSettingsUrl,
        updateAdminSettings: updateAdminSettings,
        getCurrentAdminSettings: getCurrentAdminSettings,
        invalidateAdminSettingsCache: invalidateAdminSettingsCache,
        isResourceProviderRegistered: isResourceProviderRegistered,

        getResourceTypes: getResourceTypes,

        getRateCard: getRateCard,
        getBillingInfo: getBillingInfo,
        downloadBillingInfo: downloadBillingInfo,
        deleteRateCardLineItem: deleteRateCardLineItem,
        getRateCardItems: getRateCardItems,
        getRateCardsDataSetInfo: getRateCardsDataSetInfo,
        getRateCardItemsDataSetInfo: getRateCardItemsDataSetInfo,

        setDefaultRateCardForCurrency: setDefaultRateCardForCurrency
    };
})(jQuery, this);
