/*globals window,document,Shell,Exp,jQuery,Option,waz,BillingAdminExtension*/

(function (global, $, Shell, Exp, undefined) {
    "use strict";


    var rateCardSelected,
        billingAdminExtension,
        rateCardsListView = "rateCardsListView",
        rateCardLinesListView = "rateCardLinesListView",
        rateCardNavigationType = "RateCard",
        resources = global.Resources.getResources("BCP.Billing.AdminExtension.BillingAdminResources"),
    BillingExtensionActivationInit,
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
                global.BillingAdminExtension.settings.skipQuickStart = JSON.parse(setting.Value);
            }
        });

        global.BillingAdminExtension.settings.skipQuickStart = false;
    }

    function loadQuickStart(extension, renderArea, renderData) {
        clearCommandBar();
        global.BillingAdminExtension.QuickStartTab.loadTab(renderData, renderArea);
    }

    function loadRateCard(extension, renderArea, renderData) {
        rateCardSelected = null;
        clearCommandBar();
        global.BillingAdminExtension.RateCardTab.loadTab(renderData, renderArea);
    }

    function loadRateCardConfiguration(extension, renderArea, renderData) {
        rateCardSelected = null;
        clearCommandBar();
        global.BillingAdminExtension.RateCardConfigurationTab.loadTab(renderData, renderArea);
    }

    function loadSystem(extension, renderArea, renderData) {
        clearCommandBar();
        global.BillingAdminExtension.SystemTab.loadTab(renderData, renderArea);
    }

    function loadRateCardLinesTab(extension, renderArea, renderData) {
        rateCardSelected = null;
        billingAdminExtension.RateCardLinesTab.cleanUp();
        clearCommandBar();
        billingAdminExtension.RateCardLines.loadTab(renderArea, renderData);
    }

    function showCommands(commands) {
        Exp.UI.Commands.Global.clear();
        Exp.UI.Commands.Contextual.clear();
        $.each(commands, function (index, cmd) {
            Exp.UI.Commands.Contextual.add(
                     new Exp.UI.Command(cmd.id, cmd.displayName, Exp.UI.CommandIconDescriptor.getWellKnown(cmd.iconName), true, null, cmd.executeCommand));

        });
        Exp.UI.Commands.update();
    }

    function getNavigationTabs() {
        // Accounts tab
        var tabs = [];

        tabs.push({
            id: rateCardsListView,
            displayName: "Rate Cards",
            template: "rateCardTabContainer",
            activated: loadRateCard,
            commandButtons: billingAdminExtension.RateCardTab.commandButtons
        });

        return tabs;
    }

    function loadSettingsTab(extension, renderArea, renderData) {
        global.BillingAdminExtension.SettingsTab.loadTab(renderData, renderArea);
    }

    global.BillingExtension = global.BillingAdminExtension || {};

    navigation = {
        tabs: [
                {
                    id: "quickStart",
                    displayName: resources.QuickStart,
                    template: "quickStartTab",
                    activated: loadQuickStart
                },
                {
                    id: "settings",
                    displayName: resources.Settings,
                    template: "settingsTab",
                    activated: loadSettingsTab
                },
                {
                    id: "rateCard",
                    displayName: "Rate Card Management",
                    template: "rateCardTab",
                    activated: loadRateCard
                },
                 {
                     id: "rateCardItem",
                     displayName: "Rate Card Configuration",
                     template: "rateCardConfigurationTab",
                     activated: loadRateCardConfiguration
                 },
                 {
                     id: "system",
                     displayName: "System Operations",
                     template: "systemTab",
                     activated: loadSystem
                 }
        ],
        types: [
        ]
    };


    
    function getDrawerSubMenuItems() {
        // drawer sub-menu items
        var subMenu = [];

        if (featureSupported("AspNetMembershipAccounts")) {
            subMenu.push(accountsAdminExtension.getQuickCreateWithMembershipMenuItem());
        } else {
            subMenu.push(accountsAdminExtension.getQuickCreateWithRdfeMenuItem());
        }

        return subMenu;
    }

    billingAdminExtension = global.BillingAdminExtension = global.BillingAdminExtension || {};
    BillingExtensionActivationInit = function () {
        var BillingExtension = $.extend(this, global.BillingAdminExtension);

     
        $.extend(BillingExtension, {
            displayName: resources.Billing,
            viewModelUris: [
                global.BillingAdminExtension.Controller.adminSettingsUrl,
            ],
            menuItems: [],
            settings: {
                skipQuickStart: true
            },
            getResources: function () {
                return resources;
            },
            setSelectedRateCard: function (rateCard) {
                rateCardSelected = rateCard;
            },
            getSelectedAccount: function () {
                return rateCardSelected;
            },
        });

        BillingExtension.onApplicationStart = onApplicationStart;
        BillingExtension.setCommands = clearCommandBar();

        Shell.UI.Pivots.registerExtension(BillingExtension, function () {
            Exp.Navigation.initializePivots(this, navigation);
        });

        // Finally activate BillingExtension 
        $.extend(global.BillingAdminExtension, Shell.Extensions.activate(BillingExtension));
    };

    Shell.Namespace.define("BillingAdminExtension", {
        init: BillingExtensionActivationInit,
        showCommands: showCommands
    });

})(this, jQuery, Shell, Exp);