/*globals window,jQuery,UploadTenantExtension,Exp,waz,cdm*/
(function ($, global, undefined) {
    "use strict";

    var resources = global.Resources.getResources("BCP.Upload.TenantExtension.UploadTenantResources");
    var grid,
        tabRenderArea,
        tabInitData,
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
            updateContextualCommands(row);
        }
    }

    function onUploadCommandInvoke() {
        var _deferred = $.Deferred(),
            formSelector = "#storageFileUploadForm";
        var subscriptionId = $('#accountPlanDropDown').val();

        global.Shell.UI.DialogPresenter.show({
            extension: "UploadTenantExtension",
            name: "StorageFileUpload",
            template: "FileUploadWizard",
            data: {
                data: tabInitData
            },

            init: function () {
                global.Shell.UI.Validation.setValidationContainer(formSelector);
            },

            ok: function () {
                if (!global.Shell.UI.Validation.validateContainer(formSelector)) {
                    return false;
                } else {
                    var promise = global.UploadTenantExtension.Controller.uploadFileAsync(formSelector, subscriptionId);
                    global.waz.interaction.showProgress(
                        promise,
                        {
                            initialText: "Uploading file.",
                            successText: "Successfully uploaded  file to storage folder.",
                            failureText: "Failed to upload file to storage folder."
                        }
                    );

                    promise.always(function () {
                        loadGrid(subscriptionId);
                    });

                    promise.done(function (result) {
                        console.log("Upload", result);
                        loadGrid(subscriptionId);
                        _deferred.resolve(result);
                    })
                        .fail(function (result) {
                            _deferred.fail(result);
                        });

                    //$(formSelector).submit();
                    return true;
                }
            }
        });
    }

    // Command handlers
    function onDeleteUploadRecord() {
        var subscriptionId = $('#accountPlanDropDown').val();
        global.UploadTenantExtension.Controller.deleteUploadRecord(subscriptionId,selectedRow.Id)
            .done(
            function (r) {
                if (r.isComplete) {
                    var sid = $('#accountPlanDropDown').val();
                    loadGrid(sid);
                }
            });
    }

    function updateContextualCommands(domain) {
        Exp.UI.Commands.Contextual.clear();
        Exp.UI.Commands.Contextual.add(new Exp.UI.Command("Upload", "Upload", Exp.UI.CommandIconDescriptor.getWellKnown("Upload"), true, null, onUploadCommandInvoke));
        Exp.UI.Commands.Contextual.add(new Exp.UI.Command("deleteUploadRecord", "Delete", Exp.UI.CommandIconDescriptor.getWellKnown("delete"), true, null, onDeleteUploadRecord));
        Exp.UI.Commands.update();
    }

    function onViewInfo(item) {
        cdm.stepWizard({
            extension: "DomainTenantExtension",
            steps: [
                {
                    template: "viewInfo",
                    contactInfo: global.DomainTenantExtension.Controller.getCurrentUserInfo(),
                    domain: selectedRow
                }
            ]
        },
        { size: "mediumplus" });
    }

    function togglePlansComboBox(selector, enable) {
        if (enable) {
            $(selector).removeAttr("disabled");
        } else {
            $(selector).attr("disabled", true);
        } 
    }

    function renderListOfHostingOffers(selector) {


        var listOfPlans = global.Exp.Rdfe.getSubscriptionsRegisteredToService("Upload");

        var options, plansDropDown = $(selector);

        // Combining jsrender html-encoding and custom attribute encoding together {{>UnambiguousSubscriptionName}}
        options = $.templates("<option value=\"{{attr:id}}\">{{>OfferFriendlyName}} {{>id}}</option>").render(listOfPlans);
        plansDropDown.append(options);
        // Restore active views back to its original value

        togglePlansComboBox(selector, true);
    }

 


    // Public
    function loadTab(extension, renderArea, initData) {
        updateContextualCommands();
        tabRenderArea = renderArea;
        tabInitData = initData;
        //render resources for the html tabs
        $("#mainContainer").html(global.UploadTenantExtension.templates.uploadRecordsTab.render(resources));
        renderListOfHostingOffers("#accountPlanDropDown");

        //declare the array to hold the subscription ids
        var subIds = [];

        //get subscriptions for Billing resource provider
        var susbscriptionIds = global.Exp.Rdfe.getSubscriptionsRegisteredToService("Upload");

        //iterate through the subscriptions array to get their ids
        susbscriptionIds.forEach(function (sub) {
            subIds.push(sub.id);
        });

        var subs = Exp.Rdfe.getSubscriptionList();
        

        var sid = $('#accountPlanDropDown').val();
        loadGrid(sid);
     

        $('#accountPlanDropDown').change(function () {
            loadGrid(sid);
        });
    }

    function loadGrid(sid) {
        var localDataSet,
        columns = [
            { name: "Id", field: "Id", filterable: true, sortable: true },
            { name: "File Name", field: "Name", filterable: true, sortable: true },
            { name: "Date Uploaded", field: "CreatedDate", formatter: $.fxGridFormatter.date("G"), filterable: false, sortable: true },
            { name: "Date Expired", field: "ExpiredDate", formatter: $.fxGridFormatter.date("G"), filterable: false, sortable: true },
            { name: "Type", field: "MimeType", filterable: true, sortable: true },
            { name: "Size (GB)", field: "Size", filterable: false, sortable: true }
            
            ];
        var currentUserId = $("div.fxs-avatarbar span").text();
        global.UploadTenantExtension.Controller.getUploadRecords({ subscriptionId: sid, userId: currentUserId })
            .done(
            function (p1, p2) {
                localDataSet = p1;

                //display empty template if no records are fetched
                if (localDataSet.data.length > 0) {
                    //call grid once the data is fetched
                    grid = tabRenderArea.find(".gridContainer")
                        .wazObservableGrid("destroy")
                        .wazObservableGrid({
                            lastSelectedRow: null,
                            data: localDataSet.data,
                            keyField: "id",
                            columns: columns,
                            fastPollingOnDataSet: false,
                            gridOptions: {
                                rowSelect: onRowSelected
                            }
                        });
                }
                else {
                    $(".gridContainer").html(global.UploadTenantExtension.templates.uploadRecordsTabEmpty.render(resources));
                }
            });
    }

    function cleanUp() {
        if (grid) {
            grid.wazObservableGrid("destroy");
            grid = null;
        }
    }

    function forceRefreshData() {
        try {

            var sid = $('#accountPlanDropDown').val();
            loadGrid(sid);
            // When we navigate to the tab, sometimes this method is called before observableGrid is not intialized, which will throw exception.
            //grid.wazObservableGrid("refreshData");
        } catch (e) {
            // When the grid fails to refresh, we still need to refresh the underlying dataset to make sure it has latest data; otherwise will cause data inconsistent.
            //Exp.Data.forceRefresh(StorageAdminExtension.Controller.getSharesDataSetInfo().dataSetName);

            //var sid = $('#accountPlanDropDown').val();
            //loadGrid(sid);
        }
    }

    global.UploadTenantExtension = global.UploadTenantExtension || {};
    global.UploadTenantExtension.UploadRecordsTab = {
        loadTab: loadTab,
        cleanUp: cleanUp,
        statusIcons: statusIcons,
        forceRefreshData: forceRefreshData
    };
})(jQuery, this);