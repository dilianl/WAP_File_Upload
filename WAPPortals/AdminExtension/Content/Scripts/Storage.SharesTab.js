/*globals window,jQuery,Exp,waz*/
(function ($, global, Shell, Exp, undefined) {
    "use strict";

    var observableGrid,
        selectedRow,
        statusIcons = {
            Registered: {
                text: "Registered",
                iconName: "complete"
            },
            Default: {
                iconName: "spinner"
            }
        };

    function onRowSelected(row) {
        if (row) {
            selectedRow = row;
            //updateContextualCommands(row);
        }
    }

    function updateContextualCommands(domain) {
        Exp.UI.Commands.Contextual.clear();
        Exp.UI.Commands.Contextual.add(new Exp.UI.Command("deleteShare", "Delete", Exp.UI.CommandIconDescriptor.getWellKnown("delete"), true, null, onDeleteShare));
        Exp.UI.Commands.update();
    }

    function onDeleteShare() {
        global.StorageAdminExtension.Controller.deleteShare(selectedRow.ShareId)
            .done(
            function (r) {
                if (r.isComplete) {
                    forceRefreshSharesData();
                }
            });
    }

    function loadTab(extension, renderArea, initData) {
        updateContextualCommands();
        var columns = [
                { name: "Id", field: "ShareId", sortable: false },
                { name: "Name", field: "ShareName", sortable: false },
                { name: "Total Space", field: "TotalSpace", filterable: false, sortable: false },
                { name: "Free Space", field: "FreeSpace", filterable: false, sortable: false },
                { name: "User", field: "UserName", sortable: false },
                { name: "Network File Share", field: "NetworkSharePath", filterable: false, sortable: false }
            ];

        observableGrid = renderArea.find(".grid-container")
            .wazObservableGrid("destroy")
            .wazObservableGrid({
                lastSelectedRow: null,
                data: global.StorageAdminExtension.Controller.getSharesDataSetInfo(),
                keyField: "ShareId",
                columns: columns,
                gridOptions: {
                    rowSelect: onRowSelected
                },
                emptyListOptions: {
                    extensionName: "StorageSampleAdminExtension",
                    templateName: "sharesTabEmpty"
                }
            });
    }

    function cleanUp() {
        if (observableGrid) {
            observableGrid.wazObservableGrid("destroy");
            observableGrid = null;
        }
    }

    function forceRefreshSharesData() {
        try {
            // When we navigate to the tab, sometimes this method is called before observableGrid is not intialized, which will throw exception.
            observableGrid.wazObservableGrid("refreshData");
        } catch (e) {
            // When the grid fails to refresh, we still need to refresh the underlying dataset to make sure it has latest data; otherwise will cause data inconsistent.
            Exp.Data.forceRefresh(StorageAdminExtension.Controller.getSharesDataSetInfo().dataSetName);
        }
    }

    global.StorageAdminExtension = global.StorageAdminExtension || {};
    global.StorageAdminExtension.SharesTab = {
        loadTab: loadTab,
        cleanUp: cleanUp,
        forceRefreshSharesData: forceRefreshSharesData
    };
})(jQuery, this, this.Shell, this.Exp);