/*globals window,jQuery,Shell,Exp,waz*/

(function (global, $, shell, exp, resources, constants, undefined) {
    "use strict";

    var storageExtensionActivationInit,
        navigation;   

    function clearCommandBar() {
        Exp.UI.Commands.Contextual.clear();
        Exp.UI.Commands.Global.clear();
        Exp.UI.Commands.update();
    }

    function onApplicationStart() {
        Exp.UserSettings.getGlobalUserSetting("Admin-skipQuickStart").then(function (results) {
            var setting = results ? results[0] : null;
            if (setting && setting.Value) {
                global.StorageAdminExtension.settings.skipQuickStart = JSON.parse(setting.Value);
            }
        });
                
        global.StorageAdminExtension.settings.skipQuickStart = false;
    }

    function loadQuickStart(extension, renderArea, renderData) {
        clearCommandBar();
        global.StorageAdminExtension.QuickStartTab.loadTab(renderData, renderArea);
    }

    function loadFileServersTab(extension, renderArea, renderData) {
        global.StorageAdminExtension.FileServersTab.loadTab(renderData, renderArea);
    }

    function loadProductsTab(extension, renderArea, renderData) {
        global.StorageAdminExtension.ProductsTab.loadTab(renderData, renderArea);
    }

    function loadSettingsTab(extension, renderArea, renderData) {
        global.StorageAdminExtension.SettingsTab.loadTab(renderData, renderArea);
    }

    function loadControlsTab(extension, renderArea, renderData) {
        global.StorageAdminExtension.ControlsTab.loadTab(renderData, renderArea);
    }

    function loadSharesTab(extension, renderArea, renderData) {
        global.StorageAdminExtension.SharesTab.loadTab(renderData, renderArea);
    }

    global.storageExtension = global.StorageAdminExtension || {};

    navigation = {
        tabs: [
                {
                    id: "quickStart",
                    displayName: "quickStart",
                    template: "quickStartTab",
                    activated: loadQuickStart
                },
                {
                    id: "shares",
                    displayName: "shares",
                    template: "sharesTab",
                    activated: loadSharesTab
                },
                {
                    id: "settings",
                    displayName: "settings",
                    template: "settingsTab",
                    activated: loadSettingsTab
                }
        ],
        types: [
        ]
    };

    storageExtensionActivationInit = function () {
        var storageExtension = $.extend(this, global.StorageAdminExtension);

        $.extend(storageExtension, {
            displayName: "Storage",
            viewModelUris: [
                global.StorageAdminExtension.Controller.adminSettingsUrl,
                global.StorageAdminExtension.Controller.adminProductsUrl,
            ],
            menuItems: [
                {
                    name: constants.extensionName,
                    displayName: resources.MenuFirstStoryDisplayName,
                    url: "#Workspaces/StorageAdmin",
                    description: resources.MenuRunbookQuickCreateDescription,
                    isEnabled: function () {
                        //var isExtensionReady = automationAdminExtension.settings.isAutomationEndpointRegistered && global.Shell.extensionIndex.AutomationAdminExtension.dataIsLoaded;
                        //return {
                        //    enabled: isExtensionReady,
                        //    description: isExtensionReady ? resources.MenuRunbookQuickCreateDescription : resources.AutomationResourceNotAvailable
                        //};
                        return {
                            enabled: true,
                            description: "Create data storage services."
                        }
                    },
                    subMenu: [
                        StorageAdminExtension.Menu.getQuickCreateShareMenuItem()
                    ]
                }
            ],
            settings: {
                skipQuickStart: true
            },
            getResources: function () {
                return resources;
            }
        });

        storageExtension.onApplicationStart = onApplicationStart;        
        storageExtension.setCommands = clearCommandBar();

        Shell.UI.Pivots.registerExtension(storageExtension, function () {
            Exp.Navigation.initializePivots(this, navigation);
        });

        // Finally activate storageSampleExtension 
        $.extend(global.StorageAdminExtension, Shell.Extensions.activate(storageExtension));
    };

    Shell.Namespace.define("StorageAdminExtension", {
        init: storageExtensionActivationInit
    });

})(this, jQuery, Shell, Exp, StorageAdminExtension.Resources, StorageAdminExtension.Constants);
