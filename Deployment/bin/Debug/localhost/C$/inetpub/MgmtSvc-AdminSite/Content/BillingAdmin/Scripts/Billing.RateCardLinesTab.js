/*globals window,jQuery,AccountsAdminExtension,waz,Exp*/
/// <dictionary>jslint</dictionary>
(function (global, $, undefined) {
    "use strict";
    var resources = global.Resources.getResources("BCP.Billing.AdminExtension.BillingAdminResources"),
        
        grid,
        selectedUserName,
        selectedRateCard,
      
        entityMonitoredForOperationDoneEvent;


    function setCommands() {
        var dataSet = [], commands;

        //if (selectedSubscriptionRow) {
        //    dataSet = global.AccountsAdminExtension.Controller.getUserSubscriptionsDataSet(selectedUserName);
        //}
        //commands = global.AccountsAdminExtension.Shared.Subscription.getUserDashboardCommands(selectedAccount, selectedSubscriptionRow, dataSet);
        //global.AccountsAdminExtension.Shared.Subscription.setCommands(commands);
    }

    function renderStatusBar() {
        var statusBar = $(".account-dashboard-statusbar"),
            statusBarStatuses = [
                { name: "Active", displayName: resources.AccountStatusBarActiveState, display: "Info" },
                { name: "ActiveSyncing", displayName: resources.AccountStatusBarActiveSyicingState, display: "Info" },
                { name: "ActiveOutOfSync", displayName: resources.AccountStatusBarActiveOutOfSyncState, display: "Error" },
                { name: "Suspended", displayName: resources.AccountStatusBarSuspendedState, display: "Warning" },
                { name: "SuspendedSyncing", displayName: resources.AccountStatusBarSuspendedSyncingState, display: "Warning" },
                { name: "SuspendedOutOfSync", displayName: resources.AccountStatusBarSuspendedOufOfSyncState, display: "Error" },
                { name: "DeletePendingSyncing", displayName: resources.AccountStatusBarDeletePendingSyncingState, display: "Warning" },
                { name: "DeletePendingOutOfSync", displayName: resources.AccountStatusBarDeletePendingOutOfSyncState, display: "Error" }
            ],
            status, uiMessage;

        statusBar.wazStatusBar("destroy");

        if (selectedAccount) {
            status = selectedAccount.Status;
            // messages are calculated in order of priority. Higher pri messages override lower-pri messages. Only single message with higher pri is shown in the UI
            //switch (status) {
            //    case global.AccountsAdminExtension.Controller.userStatus.active:
            //        uiMessage = resources.AccountStatusBarActiveMessage;
            //        break;
            //    case global.AccountsAdminExtension.Controller.userStatus.suspended:
            //        uiMessage = resources.AccountStatusBarSuspendedMessage;
            //        break;
            //    case global.AccountsAdminExtension.Controller.userStatus.activeSyncing:
            //    case global.AccountsAdminExtension.Controller.userStatus.suspendedSyncing:
            //    case global.AccountsAdminExtension.Controller.userStatus.deletePendingSyncing:
            //        uiMessage = resources.AccountStatusBarSyncingMessage;
            //        break;
            //    case global.AccountsAdminExtension.Controller.userStatus.activeOutOfSync:
            //    case global.AccountsAdminExtension.Controller.userStatus.suspendedOutOfSync:
            //    case global.AccountsAdminExtension.Controller.userStatus.deletePendingOutOfSync:
            //        uiMessage = selectedAccount.LastErrorMessage;
            //        break;
            //    default:
            //        throw "unexpected subscription status";
            //}

            // BUG 829353: At the moment wazStatusBar does not perform html encoding and that breaks when LastErrorMessage contains XML
            //uiMessage = global.Shell.Utilities.htmlEncode(uiMessage);

            if (status) {
                statusBar.wazStatusBar({
                    statuses: statusBarStatuses,
                    currentStatus: status,
                    currentStatusDisplayMessage: "status"
                });
            }
        }
    }

    function refreshView() {
        renderStatusBar();
        setCommands();
    }

    function rewireAccountStatusListener(callback) {
        if (globalStatusListener) {
            globalStatusListener.unbind();
            globalStatusListener = null;
        }

        if (entityMonitoredForOperationDoneEvent) {
            entityMonitoredForOperationDoneEvent.off(global.waz.dataWrapper.operationDoneEventName, callback);
            entityMonitoredForOperationDoneEvent = null;
        }

        if (selectedRateCard) {
            globalStatusListener = new global.waz.PropertyChangedListener("Status", selectedRateCard, callback);
            entityMonitoredForOperationDoneEvent = $(selectedRateCard);
            entityMonitoredForOperationDoneEvent.on(global.waz.dataWrapper.operationDoneEventName, callback);
        }
    }

    function onRowSelected(row) {
        selectedSubscriptionRow = row;
        setCommands();
    }

    function loadTab(renderArea, renderData) {
        var columns, dataSetInfo, accounts;

        // Below, keep filterable/sortable in sync with capabilities of backing SQL sprocs/functions.
        // TODO: Enable sorting on Status and EnrollmentDate columns when the UXFX fixes the formatter/remote sorting issue
        columns = [
            //{ name: resources.SubscriptionColumnName, field: "TenantSubscriptionId", type: "navigation", navigationField: "id", sortable: false },
            //{ name: resources.StatusColumnName, field: "SubscriptionStatus", type: "status", displayStatus: global.AccountsAdminExtension.Shared.Subscription.getStatusIconFunction(), filterable: false, sortable: false },
            //{ name: resources.RoleColumnName, field: "Role", type: "text", filterable: false },
            //{ name: resources.PlanColumnName, field: "OfferFriendlyName", type: "text" },
            //{ name: resources.EnrollmentDateColumnName, field: "Created", type: "date", formatter: $.fxGridFormatter.date("G"), filterable: false, sortable: true }
        ];

        // Cache selected user name
        selectedUserName = renderData.UserName;
        selectedRateCard = renderData;
        dataSetInfo = global.BillingAdminExtension.Controller.getRateCardsDataSetInfo();

        rateCards = global.AccountsAdminExtension.Controller.getActiveRateCards();
                

        grid = renderArea.find(".gridContainer")
            .wazObservableGrid("destroy")
            .wazObservableGrid({
                data: dataSetInfo,
                stateImpactingFields: ["SubscriptionStatus"],
                columns: columns,
                keyField: "Id",
                gridOptions: {
                    rowSelect: onRowSelected,
                    selectFirstRowByDefault: false // it is easy to confuse on this page that commands are not for user but for a selected subscription. DO NOT select subscription by default.
                },
                emptyListOptions: {
                   
                }
            });

        rewireAccountStatusListener(refreshView); // this will call refreshView()
    }

    function cleanUp() {
        if (grid) {
            grid.wazObservableGrid("destroy");
            grid = null;
        }
    }

    function getSubscriptionNavigationItems(accountName) {
        var items = [],
            dataSet,
            backNavigation = {
                view: "rateCardLinesListView",
                //name: selectedSubscriptionRow.Name, // name will be set below
                type: "TenantAccount"
            };


        //dataSet = global.AccountsAdminExtension.Controller.getUserSubscriptionsDataSet(accountName);

        if (dataSet) {
            items = dataSet.data.items;
        }

        // if possible - return observable collection from underlying data set
        items = $.each(items, function (index, value) {
            value.name = value.id;
            value.displayName = value.id;
        });

        return {
            data: items,
            backNavigation: backNavigation
        };
    }
       
    function loadNavigationItems() {
        var items = [],
            dataSet = global.AccountsAdminExtension.Controller.getActiveRateCards();

        if (dataSet) {
            items = dataSet.data.items;
        }

        // if possible - return observable collection from underlying data set
        $.each(items, function (index, value) {
            value.name = value.id;
            value.displayName = value.id;
            value.navigationPath = {
                type: value.Type,
                name: value.id
            };
        });

        return {
            data: items,
            backNavigation: {
                view: "rateCardsListView"
            }
        };
    }

    global.BillingAdminExtension = global.BillingAdminExtension || {};
    global.BillingAdminExtension.RateCardLinesTab =
    {
        loadTab: loadTab,
        cleanUp: cleanUp,
        loadNavigationItems: loadNavigationItems,
       
        getSubscriptionNavigationItems: getSubscriptionNavigationItems
    };
})(this, jQuery); // Ignore jslint
