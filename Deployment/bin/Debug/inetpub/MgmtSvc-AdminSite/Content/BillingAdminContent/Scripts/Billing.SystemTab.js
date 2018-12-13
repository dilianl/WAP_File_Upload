/// <reference path="Billingadmin.controller.js" />
(function ($, global, fx, Exp, undefined) {
    "use strict";

    var resources = global.Resources.getResources("BCP.Billing.AdminExtension.BillingAdminResources"),
        selectedRow,
       grid,
       columns,
       defaultIconName = "spinner",
       commandButtons;

    function setCommands(item) {
        var commands = [], extension = global.BillingAdminExtension;
        extension.showCommands(commands);
    }

    function runBilling(billingDate) {
        waz.interaction.showProgress(
                      Shell.Net.ajaxPost({
                          url: "/BillingAdmin/RunBillingCalculations",
                          data: {
                              billingCalculationDate: billingDate
                          }
                      }).done(function () {

                      }),
                   {
                       initialText: "Start long-running billing calculation",
                       successText: "Billing calculation completed",
                       failureText: "Failed to complete billing calculation"
                   }
               );
    }


    // Public
    function loadTab(renderData, renderArea) {
        Shell.UI.Validation.setValidationContainer("#billingCalcDate");
     
        $('#billingCalcDate').datepicker({
            changeMonth: true,
            changeYear: true,
            yearRange: "-50:+50",
            showButtonPanel:true,
            onSelect: function(selectedDate) {
                alert(selectedDate);
            },
            beforeShow: function(el, dp) {
                $('#ui-datepicker-div').toggleClass('hide-calendar',   $(el).is('[data-calendar="false"]'));
            },
            onClose: function (dateText, inst) {
                var iMonth = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
                var iYear = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
                $(this).datepicker('setDate', new Date(iYear, iMonth, 1));
            }
        });
    
        $('#runCalculations').on("click", function () {
            runBilling($('#billingCalcDate').datepicker("getDate"));
        });
    }


    function cleanup() {
        if (grid) {
            grid.wazObservableGrid("destroy");
            grid = null;
        }
    }

    global.BillingAdminExtension = global.BillingAdminExtension || {};
    global.BillingAdminExtension.SystemTab = {
        loadTab: loadTab,
        cleanup: cleanup
    };
})(jQuery, this, this.fx, this.Exp);