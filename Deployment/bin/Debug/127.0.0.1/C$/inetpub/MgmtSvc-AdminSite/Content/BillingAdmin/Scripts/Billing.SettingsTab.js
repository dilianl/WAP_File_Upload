/// <reference path="Billingadmin.controller.js" />
/*globals,jQuery,trace,cdm,BillingAdminExtension,waz,Exp*/
(function ($, global, Shell, Exp, undefined) {
    "use strict";
    var resources = global.Resources.getResources("BCP.Billing.AdminExtension.BillingAdminResources");
    var commandsEnabled,
        passwordChanged = false;

    function renderPage(adminSettings) {
        $("#um-endpointUrl").val(adminSettings.EndpointAddress ? adminSettings.EndpointAddress : null);
        $("#um-username").val(adminSettings.Username ? adminSettings.Username : null);
        $("#um-password").val(adminSettings.Password ? adminSettings.Password : null);
    }

    function onSettingChanged() {
        updateContextualCommands(true);
    }

    function updateContextualCommands(hasPendingChanges) {
        if (commandsEnabled !== hasPendingChanges) {
            Exp.UI.Commands.Contextual.clear();
            if (hasPendingChanges) {
                Exp.UI.Commands.Contextual.add(new Exp.UI.Command("saveSettings", resources.SettingsTabSaveSettings, Exp.UI.CommandIconDescriptor.getWellKnown("save"), true, null, onSaveSettings));
                Exp.UI.Commands.Contextual.add(new Exp.UI.Command("discardSettings", resources.SettingsTabDiscardSettings, Exp.UI.CommandIconDescriptor.getWellKnown("reset"), true, null, onDiscardSettings));
                Shell.UI.Navigation.setConfirmNavigateAway(resources.SettingsTabConfirmNavigateAway);
                commandsEnabled = true;
            } else {
                Shell.UI.Navigation.removeConfirmNavigateAway();
                commandsEnabled = false;
            }
            Exp.UI.Commands.update();
        }
    }

    // Command handlers
    function onSaveSettings() {
        var progressOperation, newSettings;

        progressOperation = new Shell.UI.ProgressOperation(resources.SettingsTabProgressOperationUpdatingSettings, null /* call back */, false /*isDeterministic */);
        Shell.UI.ProgressOperations.add(progressOperation);

        newSettings = $.extend(true, {}, global.BillingAdminExtension.Controller.getCurrentAdminSettings());
        newSettings.EndpointAddress = $("#um-endpointUrl").val();
        newSettings.Username = $("#um-username").val();
        newSettings.Password = passwordChanged ? $("#um-password").val() : null;
        newSettings.LoadBalancerIPAddress = $("#um-loadBalancerIP").val();

        global.BillingAdminExtension.Controller.updateAdminSettings(newSettings)
            .done(function (data, textStatus, jqXHR) {
                progressOperation.complete(resources.SettingsTabProgressOperationComplete, Shell.UI.InteractionSeverity.information);
                global.BillingAdminExtension.Controller.invalidateAdminSettingsCache();
                updateContextualCommands(false);
                passwordChanged = false;
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                var message = resources.SettingsTabProgressOperationFailed;
                global.Exp.Utilities.failProgressOperation(progressOperation, message, Exp.Utilities.getXhrError(jqXHR));
            });
    }

    function onDiscardSettings() {
        renderPage(global.BillingAdminExtension.Controller.getCurrentAdminSettings());
        updateContextualCommands(false);
    }

    // Public
    function loadTab(renderData, container) {
        commandsEnabled = false;
        $(".waz-config").html(global.BillingAdminExtension.templates.settingsTab.render(resources));
        // Intialize the local data update event handler
        global.BillingAdminExtension.Controller.invalidateAdminSettingsCache()
            .done(function (url, dataSet) {
                $(dataSet.data).off("propertyChange").on("propertyChange", function () {
                    renderPage(dataSet.data);
                });
                $(dataSet.data).trigger("propertyChange");
            });

        Shell.UI.Validation.setValidationContainer("#um-settings");  // Initialize validation container for subsequent calls to Shell.UI.Validation.validateContainer.
        $("#um-settings").on("change.fxcontrol", onSettingChanged);

        $("#um-password").on("keyup change", function () {
            passwordChanged = true;
        });
    }

    global.BillingAdminExtension = global.BillingAdminExtension || {};
    global.BillingAdminExtension.SettingsTab = {
        loadTab: loadTab
    };
})(jQuery, this, this.Shell, this.Exp);