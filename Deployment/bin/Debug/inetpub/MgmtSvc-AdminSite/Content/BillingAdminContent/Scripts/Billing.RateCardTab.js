/// <reference path="Billingadmin.controller.js" />
(function ($, global, fx, Exp, undefined) {
    "use strict";

    var resources = global.Resources.getResources("BCP.Billing.AdminExtension.BillingAdminResources"),
        selectedRow,
       grid,
       columns,
       defaultIconName = "spinner",
       commandButtons,
       /// <disable>JS2076.IdentifierIsMiscased</disable>
      rateCardStatus = {
          Active: { iconName: "complete", text: "Active" },
          Suspended: { iconName: "paused", text: "Inactive" },
          SuspendedSyncing: { iconName: "spinner", text: "Syncing" }

      };

    commandButtons = {
        Create: {
            id: "Create",
            displayName: "Create Rate Card",
            iconName: "disableaccess",
            executeCommand: rateCard_performCreateCommand
        },
        Clone: {
            id: "Clone",
            displayName: "Clone Rate Card",
            iconName: "clone",
            executeCommand: rateCard_performCloneCommand
        },
        Default: {
            id: "Default",
            displayName: "Make Default",
            iconName: "clone",
            executeCommand: rateCard_performMakeDefaultCommand
        }
    };

    function rateCard_performMakeDefaultCommand() {
        var currency, rateCardId, rateCardName;

        if (waz.dataWrapper.isRowOperable(selectedRow)) {
            currency = selectedRow.Currency.Code;
            rateCardName = selectedRow.Name;
            rateCardId = selectedRow.Id;

            waz.interaction.confirm("Rate card {0} will become default for currency {1}".format(rateCardName, currency))
                .done(function () {
                    waz.interaction.showProgress(
                        global.BillingAdminExtension.Controller.setDefaultRateCardForCurrency(rateCardId, currency),
                        {
                            initialText: "Setting {0} as default for currency {1} ...".format(rateCardName, currency),
                            successText: "{0} is set as default for currency {1}.".format(rateCardName, currency),
                            failureText: "Could not set {0} as default for currency".format(rateCardName, currency)
                        }
                    );
                });
        }
    }

    function rateCard_performCloneCommand() {
        var wizard = getCloneRateCardWizard(selectedRow);
        global.cdm.stepWizard(wizard, { size: "small" });
    }

    function getCloneRateCardWizard(appData) {

        var validationContainerSelector = '#aux-cloneRateCardForm';
        var cloneRateCardStep = {
            template: "cloneRateCard",
            data: { rateCardSource: appData.Name },
            onStepActivate: function () {
                Shell.UI.Validation.setValidationContainer(validationContainerSelector);
                $("#rateCardName").fxTextBox({ value: "", autoRevert: true, validateOnKeyPress: true });

            },
            onNextStep: function () {
                // Prevents the flow to proceed unless the user's input is 100% accurate
                return Shell.UI.Validation.validateContainer(validationContainerSelector);
            }
        };

        var wizard = {
            extension: "BillingAdminExtension",
            steps: [cloneRateCardStep],

            onComplete: function () {

                var data = {
                    sourceRateCardId: selectedRow.Id,
                    name: $('#rateCardName').val(),
                    description: $('#rateCardDescription').val()
                };

                waz.interaction.showProgress(
                       Shell.Net.ajaxPost({
                           url: "/BillingAdmin/CloneRateCard",
                           data: data
                       }),
                    {
                        initialText: "Clone rate card",
                        successText: "Successfully cloned rate card '{0}'".format($('#rateCardName').val()),
                        failureText: "Failed to assign a rate card"
                    }
                );
            }
        };

        return wizard;
    }

    function rateCard_performCreateCommand() {
        var wizard = getCreateRateCardWizard();
        global.cdm.stepWizard(wizard, { size: "medium" });
    }

    function getCreateRateCardWizard() {

        var validationContainer = '#aux-createRateCardForm';
        var createRateCardStep = {
            template: "createRateCard",
            data: {},
            onStepActivate: function () {
                $("#rateCardName").fxTextBox({ value: "", autoRevert: true, validateOnKeyPress: true });
                Shell.UI.Validation.setValidationContainer(validationContainer);
            },
            onNextStep: function () {
                // Prevents the flow to proceed unless the user's input is 100% accurate
                return Shell.UI.Validation.validateContainer(validationContainer);
            }
        };

        var wizard = {
            extension: "BillingAdminExtension",
            steps: [createRateCardStep],

            onComplete: function () {

                var data = {
                    Name: $('#rateCardName').val(),
                    Description: $('#rateCardDescription').val(),
                    Currency: $('#rateCardCurrency').val()
                };

                waz.interaction.showProgress(
                       Shell.Net.ajaxPost({
                           url: "/BillingAdmin/CreateRateCard",
                           data: data
                       }),
                    {
                        initialText: "Create rate card",
                        successText: "Successfully created rate card '{0}'".format($('#rateCardName').val()),
                        failureText: "Failed to assign a rate card"
                    }
                );
            }
        };

        return wizard;
    }

    function setCommands(item) {
        var commands = [], extension = global.BillingAdminExtension;

        commands.push(commandButtons.Create);
        commands.push(commandButtons.Clone);
        commands.push(commandButtons.Default);
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

    function nameFormatter(value, rowNumber, columnNumber, rowDefinition) {
        var dataContext = rowNumber.dataItem;

        if (dataContext.IsDefault === true) {
            return dataContext.Name + " " + "[DEFAULT]";
        } else { return dataContext.Name; }
    }

    function currencyFormatter(value) {
        return value.Code;
    }

    var icons = {
        "false": { url: "/Content/Images/icon-validation-valid.gif", text: "Active" },
        "true": { url: "/Content/Images/icon-help.png", text: "Inactive" }
    };

    

    // Below, keep filterable/sortable in sync with capabilities of backing SQL sprocs/functions.
    // TODO: Enable sorting on Status and EnrollmentDate columns when the UXFX fixes the formatter/remote sorting issue
    columns = [
            { name: "ID", field: "Id", type: "int" },
            { name: "Name", field: "Name", type: "string", formatter: nameFormatter, filterable: false, sortable: false },
            { name: "Description", field: "Description", type: "string", filterable: false, sortable: false },
            { name: "Currency", field: "Currency", formatter: currencyFormatter, type: "string" },
            { name: "status", field: "Inactive", formatter: $.fxGridFormatter.iconLookup(icons) },
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
    function loadTab(renderData, renderArea) {

        var dataSetInfo = $.extend({
            disposeDataSet: false  // The lifetime of the data set is controlled by the extension.
        }, BillingAdminExtension.Controller.getRateCardsDataSetInfo());

        grid = renderArea.find(".gridContainer")
           .wazObservableGrid("destroy")
           .wazObservableGrid({
               data: dataSetInfo,
               columns: columns,
               keyField: "id",
               gridOptions: {
                   rowSelect: onRowSelected
               },
               emptyListOptions: {
                   extensionName: BillingAdminExtension.name,
                   templateName: "rateCardsMainListEmpty",
                   arrowLinkSelector: ("{0} .newAccountLink").format(renderArea.selector)

                   //,
                   //arrowLinkAction: BillingAdminExtension.openQuickCreate
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
    global.BillingAdminExtension.RateCardTab = {
        loadTab: loadTab,
        cleanup: cleanup,
        executeCommand: executeCommand,
        commandButtons: commandButtons
    };
})(jQuery, this, this.fx, this.Exp);