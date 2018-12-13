/// <reference path="Billingadmin.controller.js" />
(function ($, global, fx, Exp, undefined) {
    "use strict";

    var resources = global.Resources.getResources("BCP.Billing.AdminExtension.BillingAdminResources"),
        selectedRow,
       grid,
       columns,
        localDataSet,
       defaultIconName = "spinner",
       renderArea,
       commandButtons,
       /// <disable>JS2076.IdentifierIsMiscased</disable>
      rateCardStatus = {
          Active: { iconName: "complete", text: "Active" },
          Suspended: { iconName: "paused", text: "Inactive" },
          SuspendedSyncing: { iconName: "spinner", text: "Syncing" }

      },
    resourceTypes
    ;

    commandButtons = {
        Create: {
            id: "Add",
            displayName: "Add Item",
            iconName: "disableaccess",
            executeCommand: rateCardItem_performAddCommand
        },
        Remove: {
            id: "Remove",
            displayName: "Remove Item",
            iconName: "disableaccess",
            executeCommand: rateCardItem_performRemoveCommand
        },
        Update: {
            id: "Update",
            displayName: "Update Rate",
            iconName: "disableaccess",
            executeCommand: rateCardItem_performUpdateRateCommand
        }
    };

    function rateCardItem_performRemoveCommand() {
        var selectedRateCardId = $('#rateCardListDropDown').val();
        var resourceName;
        if (selectedRow !== undefined && selectedRow !== null) {
            resourceName = selectedRow.ResourceName;
            var lineItemId = selectedRow.Id;
            waz.interaction.confirm("Are you sure, you want to delete line item for product {0}".format(resourceName))
                .done(function () {
                    waz.interaction.showProgress(
                        global.BillingAdminExtension.Controller.deleteRateCardLineItem(lineItemId, selectedRateCardId)
                            .done(function () {
                                refreshGrid();
                                selectedRow = null;
                            })
                        ,
                        {
                            initialText: "Deleting '{0}'".format(resourceName),
                            successText: "Deleted '{0}'".format(resourceName),
                            failureText: "Failed to delete '{0}'".format(resourceName)
                        }
                    );
                });
        }
    }

    function rateCardItem_performAddCommand() {
        var selectedRateCardId = $('#rateCardListDropDown').val();
        var selectedRateCardCurrency = $('#rateCardListDropDown :selected').data('currency');

        var wizard = getAddRateCardItemWizard(selectedRateCardId, selectedRateCardCurrency);
        global.cdm.stepWizard(wizard, { size: "large" });

    }

    function rateCardItem_performUpdateRateCommand() {

        var selectedRateCardCurrency = $('#rateCardListDropDown :selected').data('currency');
        var wizard = getUpdateRateCardItemWizard(selectedRateCardCurrency);
        global.cdm.stepWizard(wizard, { size: "small" });

    }


    /*Render a list of active rate cards*/
    function renderListOfRateCards(selector) {
        return Shell.Net.ajaxPost({
            url: "/BillingAdmin/GetActiveRateCards"
        })
        .done(function (response, textStatus, jqXHR) {
            var options,
                rateCardsDropDown = $(selector),
                rateCardItems = response.data;

            // Combining jsrender html-encoding and custom attribute encoding together
            options = $.templates("<option data-currency=\"{{>Currency.Code}}\" value=\"{{attr:Id}}\">{{>Name}} - [{{>Currency.Code}}]</option>").render(rateCardItems);
            rateCardsDropDown.append(options);
            rateCardsDropDown.val($(selector + " option:first").val());
        });
    }

    function renderListOfResourceTypes(selector) {

        //$('#unit').text("per " + resourceTypeMap[$.trim($("#resourceTypesDropDown option:selected").text())]);

        $('#resourceTypesDropDown').change(function () {
            renderListOfResources('#resourcesDropDown', '#resourceTypesDropDown');
            $('#unit').text("per " + resourceTypeMap[$.trim($("#resourceTypesDropDown option:selected").text())]);
        });

        return Shell.Net.ajaxPost({
            url: "/BillingAdmin/GetResourceTypes"
        })
       .done(function (response, textStatus, jqXHR) {
           var options,
               resourceTypesDropDown = $(selector),
               resourceTypes = response.data;

           // Combining jsrender html-encoding and custom attribute encoding together
           options = $.templates("<option value=\"{{attr:Id}}\">{{>Name}} {{>ResourceType}}</option>")
                    .render(resourceTypes);


           resourceTypesDropDown.append(options);
           resourceTypesDropDown.val($(selector + " option:first").val());

           renderListOfResources('#resourcesDropDown', '#resourceTypesDropDown');
           $('#resourceTypesDropDown').change(function () {
               renderListOfResources('#resourcesDropDown', '#resourceTypesDropDown');
               $('#unit').text("per "+resourceTypeMap[$.trim($("#resourceTypesDropDown option:selected").text())]);
           });

       });
    }

    function renderListOfResources(selector, resourceTypeIdSelector) {
        var resourceTypeId = $(resourceTypeIdSelector).val();

        return Shell.Net.ajaxPost({
            url: "/BillingAdmin/GetResourcesByTypeId",
            data: { resourceTypeId: resourceTypeId }
        })
       .done(function (response, textStatus, jqXHR) {
           var options,
               resourceTypesDropDown = $(selector),
               resourceTypes = response.data;

           // Combining jsrender html-encoding and custom attribute encoding together
           options = $.templates("<option value=\"{{attr:Id}}\">{{>Name}}</option>").render(resourceTypes);
           $(selector + ' option').remove();
           resourceTypesDropDown.append(options);
           resourceTypesDropDown.val($(selector + " option:first").val());
           $('#unit').text("per " + resourceTypeMap[$.trim($("#resourceTypesDropDown option:selected").text())]);
       });
    }

    function getUpdateRateCardItemWizard(selectedRateCardCurrency) {
        var validationContainerSelector = '#aux-updateRateCardLineItemForm';

        var lineItemId = selectedRow.Id;

        var updateRateCardItemStep = {
            template: "updateRateCardItem",
            data: {
                lineItem: selectedRow,
                currency: selectedRateCardCurrency
            },
            onStepActivate: function () {
                Shell.UI.Validation.setValidationContainer(validationContainerSelector);
            },
            onNextStep: function () {
                // Prevents the flow to proceed unless the user's input is 100% accurate
                return Shell.UI.Validation.validateContainer(validationContainerSelector);
            }
        };

        var wizard = {
            extension: "BillingAdminExtension",
            steps: [updateRateCardItemStep],

            onComplete: function () {

                var data = {
                    rateCardItemId: lineItemId,
                    ratePerHour: $('#ratePerHour').val(),
                };

                waz.interaction.showProgress(
                       Shell.Net.ajaxPost({
                           url: "/BillingAdmin/UpdateRateCardItemRate",
                           data: data
                       }).done(function () {
                           refreshGrid();
                       }),
                    {
                        initialText: "Add rate card item",
                        successText: "Successfully created rate card line item for: '{0}'".format($("#rateCardListDropDown option:selected").text()),
                        failureText: "Failed to create rate card item"
                    }
                );


            }
        };

        return wizard;
    }

    function getAddRateCardItemWizard(selectedRateCardId, selectedRateCardCurrency) {
        
        renderListOfResourceTypes('#resourceTypesDropDown');

        var validationContainerSelector = '#aux-createRateCardLineItemForm';

        var addRateCardItemStep = {
            template: "addRateCardItem",
            data: { currency: selectedRateCardCurrency },
            onStepActivate: function () {
                Shell.UI.Validation.setValidationContainer(validationContainerSelector);


                $('#rateCardLineValidFrom').datepicker({
                    dateFormat: 'dd/mm/yy'
                })

                $('#rateCardLineValidTo').datepicker({ dateFormat: 'dd/mm/yy' });
            },
            onNextStep: function () {
                // Prevents the flow to proceed unless the user's input is 100% accurate
                return Shell.UI.Validation.validateContainer(validationContainerSelector);
            }
        };

        var wizard = {
            extension: "BillingAdminExtension",
            steps: [addRateCardItemStep],

            onComplete: function () {

                var data = {
                    rateCardId: selectedRateCardId,
                    resourceType: $('#resourceTypesDropDown option:selected').text(),
                    resourceName: $('#resourcesDropDown option:selected').text(),
                    resourceId: $('#resourcesDropDown').val(),
                    ratePerHour: $('#ratePerHour').val(),
                    resourceStatus: $('#resourceStatus').val(),
                    ValidFrom: $('#rateCardLineValidFrom').datepicker("getDate"),
                    ValidTo: $('#rateCardLineValidTo').datepicker("getDate")
                };

                waz.interaction.showProgress(
                       Shell.Net.ajaxPost({
                           url: "/BillingAdmin/CreateRateCardItem",
                           data: data
                       }).done(function () {
                           refreshGrid();
                       }),
                    {
                        initialText: "Add rate card item",
                        successText: "Successfully created rate card line item for: '{0}'".format($("#rateCardListDropDown option:selected").text()),
                        failureText: "Failed to create rate card item"
                    }
                );


            }
        };

        return wizard;
    }

    function setCommands(item) {
        var commands = [], extension = global.BillingAdminExtension;

        commands.push(commandButtons.Create);
        commands.push(commandButtons.Remove);
        commands.push(commandButtons.Update);

        extension.showCommands(commands);
    }

    function _formatRateCardStatus(value) {
        var result = rateCardStatus[value.Status];
        // Fallback to defaults if the item's status is not defined
        if (result === undefined) {
            result = { iconName: defaultIconName, text: value.Status };
        }
        return result;
    }

    function _createRateCardPlaceholder(id, status) {
        /// <disable>JS2076.IdentifierIsMiscased</disable>
        return {
            Id: id,
            Status: status
        };
        /// <enable>JS2076.IdentifierIsMiscased</enable>
    }

    function _getRateCardDataWrapper() {
        return BillingAdminExtension.Controller.getRateCardsDataWrapper();
    }

    function formatRate(value, rowNumber) {
        var dataContext = rowNumber.dataItem;
        var selectedRateCardCurrency = $('#rateCardListDropDown :selected').data('currency');
        return selectedRateCardCurrency + " " + value + " per " + resourceTypeMap[$.trim(dataContext.ResourceType)];
    }

    var resourceTypeMap = {
        "CPU": "Allocated Core",
        "MEMORY": "MByte",
        "STORAGE": "GByte"
    };

    function formatResourceType(value, rowNumber, columnNumber, rowDefinition) {
        var dataContext = rowNumber.dataItem;
        return value;
        //return value + " (in " + resourceTypeMap[dataContext.ResourceType] + ")";
    }

    


    var icons = {
        "false": { url: "/Content/Images/icon-validation-valid.gif", text: "Active" },
        "true": { url: "/Content/Images/icon-help.png", text: "Inactive" }
    };
    // Below, keep filterable/sortable in sync with capabilities of backing SQL sprocs/functions.
    // TODO: Enable sorting on Status and EnrollmentDate columns when the UXFX fixes the formatter/remote sorting issue
    columns = [
            { name: "ID", field: "Id", type: "int" },
            { name: "status", field: "Inactive", formatter: $.fxGridFormatter.iconLookup(icons) },
            { name: "Type", field: "ResourceType", formatter: formatResourceType, type: "string", filterable: false, sortable: false },
            { name: "Resource", field: "ResourceName", type: "string", filterable: false, sortable: false },
            { name: "Resource State", field: "ResourceStatus", type: "string", filterable: false, sortable: false },
            { name: "Rate", field: "Rate", type: "decimal", formatter: formatRate, filterable: false, sortable: false },
            { name: "Valid From", field: "ValidFrom", type: "date", formatter: $.fxGridFormatter.date("dd/MM/yyyy"), filterable: false, sortable: false },
            { name: "Valid To", field: "ValidTo", type: "date", formatter: $.fxGridFormatter.date("dd/MM/yyyy"), filterable: false, sortable: false },
            { name: "Created On", field: "CreatedOn", type: "date", formatter: $.fxGridFormatter.date("dd/MM/yyyy"), filterable: false, sortable: false }
    ];

    // TODO: Workaround the hack of navigation support in the grid control.
    function setNavigationObject(item) {
        // The lower-case name and display are needed for UXFX navigation to work
        if (item) {
            item.name = item.Name;
            item.displayName = item.Name;
        }

        // This allows showing navigation list in drill down website dashboard
        BillingAdminExtension.setSelectedRateCard(item);
    }

    function onRowSelected(row) {
        selectedRow = row;
        // TODO: Now that sites are virtualized, we won't ever have a full set of secondary nav
        // items.  Use only the selected account drilled into.
        setNavigationObject(row);
        // TODO: Remove the dependency on this.  Possibly call into the controller instead.
        global.cdm.setActiveItem(row);
        setCommands(row);
    }

    // Public
    function loadTab(renderData, ra) {

        renderArea = ra;
        renderListOfRateCards('#rateCardListDropDown')
        .done(function () {
            var selectedRateCardId = $('#rateCardListDropDown').val();

            var dataSetInfo = $.extend({
                disposeDataSet: false  // The lifetime of the data set is controlled by the extension.
            },
            BillingAdminExtension.Controller.getRateCardItemsDataSetInfo(selectedRateCardId));

            //get data for grid then render grid      
            refreshGrid();
        });

        $('#rateCardListDropDown').change(function () {
            refreshGrid();
        });

        var commandsLoad = [];
        commandsLoad.push(commandButtons.Create);
        BillingAdminExtension.showCommands(commandsLoad);
    }

    function refreshGrid() {
        cleanup();
        global.BillingAdminExtension.Controller.getRateCardItems({ rateCardId: $('#rateCardListDropDown').val() })
           .done(
             function (r1, r2) {

                 //assign responseText to localDataSet variable
                 localDataSet = r1;

                 //display empty template if no records are fetched
                 if (localDataSet.data.length > 0) {
                     //call grid once the data is fetched
                     grid = renderArea.find(".gridContainer")
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
                 }
             });

    }

    function cleanup() {
        if (grid) {
            grid.wazObservableGrid("destroy");
            grid = null;
        }
    }

    function executeCommand(commandId) {
        return false;
    }

    global.BillingAdminExtension = global.BillingAdminExtension || {};
    global.BillingAdminExtension.RateCardConfigurationTab = {
        loadTab: loadTab,
        cleanup: cleanup,
        executeCommand: executeCommand,
        commandButtons: commandButtons
    };
})(jQuery, this, this.fx, this.Exp);