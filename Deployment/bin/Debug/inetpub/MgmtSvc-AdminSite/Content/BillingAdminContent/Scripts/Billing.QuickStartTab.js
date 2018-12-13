/// <reference path="Billingadmin.controller.js" />
(function ($, global, fx, Exp, undefined) {
    "use strict";

    var resources = global.Resources.getResources("BCP.Billing.AdminExtension.BillingAdminResources");

    var holder,
        htmlResources = {
            quickStartImage: fx.resources.getContentUrl("Content/BillingAdmin/Images/quickstart.png"),
            resourceProviderName: resources.Billing,
            stepsToCompleteSetup: resources.QuickStartTabStepsToCompleteSetup,
            skipQuickStart: resources.QuickStartTabSkipQuickStart,
            registerRESTendpoint: resources.QuickStartTabRegisterRESTendpoint,
            initializing: resources.QuickStartTabInitializing,
            registerResourceProviderInstruction: resources.QuickStartTabRegisterResourceProviderInstruction,
            registerResellerAccountInstruction: resources.QuickStartTabRegisterResellerAccountInstruction,
        },
        steps;

    // Input Dialogs
    function registerResourceProvider() {
        var htmlResources = {
            registerEndpointTitle: resources.QuickStartTabRegisterEndpointTitle,
            registerEndpointSubTitle: resources.QuickStartTabRegisterEndpointSubTitle,
            endpointName: resources.QuickStartTabEndpointName,
            userName: resources.QuickStartTabUserName,
            password: resources.QuickStartTabPassword,
            customerAccountManagementPortalURL: resources.QuickStartTabCustomerAccountManagementPortalURL
        };

        registerEndpoint(htmlResources, false, function (newEndpointUrl, newUsername, newPassword) {
            var newSettings = $.extend(true, {}, global.BillingAdminExtension.Controller.getCurrentAdminSettings());
            newSettings.EndpointAddress = newEndpointUrl;
            newSettings.Username = newUsername;
            newSettings.Password = newPassword;

            return global.BillingAdminExtension.Controller.updateAdminSettings(newSettings);
        });
    }

    function registerEndpoint(htmlResources, registerReseller, callback) {
        var promise,
            wizardContainerSelector = ".um-registerEndpoint";

        cdm.stepWizard({
            extension: "BillingAdminExtension",
            steps: [
                {
                    template: "registerEndpoint",
                    htmlResources: htmlResources,
                    data: { registerReseller: registerReseller },
                    onStepActivate: function () {
                        Shell.UI.Validation.setValidationContainer(wizardContainerSelector);
                    }
                }
            ],

            onComplete: function () {
                var newEndpointUrl, newUserName, newPassword, newResellerPortalUrl;

                if (!Shell.UI.Validation.validateContainer(wizardContainerSelector)) {
                    return false;
                }

                newEndpointUrl = $("#um-endpointUrl").val();
                newUserName = $("#um-username").val();
                newPassword = $("#um-password").val();
                newResellerPortalUrl = registerReseller ? $("#um-portalUrl").val() : null;

                promise = callback(newEndpointUrl, newUserName, newPassword, newResellerPortalUrl);

                global.waz.interaction.showProgress(
                    promise,
                    {
                        initialText: resources.QuickStartTabInitialText,
                        successText: resources.QuickStartTabSuccessText,
                        failureText: resources.QuickStartTabFailureText
                    }
                );

                promise.done(function () {
                    global.BillingAdminExtension.Controller.invalidateAdminSettingsCache();
                    global.BillingAdminExtension.Controller.getCurrentAdminSettings().done(function (data) {
                        updateSteps(data.data);
                    });
                });
            }
        });
    }

    steps = {
        resourceProvider: {
            state: false,
            text: htmlResources.registerResourceProviderInstruction,
            cssClass: ".quickstart-step1",
            handler: registerResourceProvider
        }
    };

    function updateSteps(adminSettings) {
        var step, i;

        steps.resourceProvider.state = !!adminSettings.EndpointAddress;

        for (i in steps) {
            if (steps.hasOwnProperty(i)) {
                step = steps[i];

                if (step.state) {
                    holder.find(step.cssClass).addClass("completed");
                    removeAction(
                        holder.find(step.cssClass + " .detail .detailDescription"),
                        step.text
                    );
                } else {
                    holder.find(step.cssClass).removeClass("completed");
                    addAction(
                        holder.find(step.cssClass + " .detail .detailDescription"),
                        step.text,
                        step.handler
                    );
                }
            }
        }
    }

    function addAction(holder, name, callback) {
        holder.quickstartItems(
            {
                actions: [
                    {
                        name: name,
                        callback: function (event) {
                            event.preventDefault();
                            callback();
                            return false;
                        }
                    }
                ]
            });
    }

    function removeAction(holder, name) {
        holder.quickstartItems("destroy").quickstartItems(
            {
                actions: [{
                    name: name,
                    disabled: true
                }]
            })
            .find("a").removeAttr("href").on("click", function (e) {
                e.preventDefault();
                return false;
            });
    }

    function getSkipQuickStart() {
        var skipQuickStart = global.BillingAdminExtension.settings.skipQuickStart;

        if (skipQuickStart === null || skipQuickStart === undefined) {
            setSkipQuickStart(true);
            return true;
        }

        return skipQuickStart;
    }

    function setSkipQuickStart(value) {
        global.BillingAdminExtension.settings.skipQuickStart = value;
        Exp.UserSettings.updateGlobalUserSetting("Billing-skipQuickStart", JSON.stringify(value));
    }

    // Public
    function loadTab(renderData, container) {
        holder = container.find(".adminQuickStart")
                .html(global.BillingAdminExtension.templates.quickStartTabContent.render(htmlResources));

        // Intialize the local data update event handler
        global.BillingAdminExtension.Controller.invalidateAdminSettingsCache()
            .done(function (data) {
                $(data.data).off("propertyChange").on("propertyChange", function () {
                    updateSteps(data.data);
                });
                $(data.data).trigger("propertyChange");
            });

        Exp.Data.setFastPolling(global.BillingAdminExtension.Controller.adminSettingsUrl, true);

        $(".quickstartCheckbox").fxCheckBox({
            value: getSkipQuickStart(),
            change: function (event, data) {
                setSkipQuickStart(data.value);
            }
        });

        global.BillingAdminExtension.Controller.getCurrentAdminSettings()
        .done(function (data) {
            updateSteps(data.data);
        });
    }

    function cleanup() {
    }

    function executeCommand(commandId) {
        return false;
    }

    global.BillingAdminExtension = global.BillingAdminExtension || {};
    global.BillingAdminExtension.QuickStartTab = {
        loadTab: loadTab,
        cleanup: cleanup,
        executeCommand: executeCommand
    };
})(jQuery, this, this.fx, this.Exp);