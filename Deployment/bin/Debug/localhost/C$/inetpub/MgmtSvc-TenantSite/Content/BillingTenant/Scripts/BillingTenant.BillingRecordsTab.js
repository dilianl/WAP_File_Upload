/*globals window,jQuery,BillingTenantExtension,Exp,waz,cdm*/
(function ($, global, undefined) {
    "use strict";

    var resources = global.Resources.getResources("BCP.Billing.TenantExtension.BillingTenantResources");
    var grid,
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

    // Command handlers
    function onDownloadBillingReport() {
        console.log(selectedRow);
        global.BillingTenantExtension.Controller.downloadBillingRecords(
            selectedRow.SubscriptionId,
            selectedRow.Month,
            selectedRow.Year
            );
    }

    function updateContextualCommands(domain) {
        Exp.UI.Commands.Contextual.clear();
        Exp.UI.Commands.Contextual.add(new Exp.UI.Command("downloadBillingReport", "Download", Exp.UI.CommandIconDescriptor.getWellKnown("browse"), true, null, onDownloadBillingReport));
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


        var listOfPlans = global.Exp.Rdfe.getSubscriptionsRegisteredToService("Billing");

        var options, plansDropDown = $(selector);

        // Combining jsrender html-encoding and custom attribute encoding together {{>UnambiguousSubscriptionName}}
        options = $.templates("<option value=\"{{attr:id}}\">{{>OfferFriendlyName}} {{>id}}</option>").render(listOfPlans);
        plansDropDown.append(options);
        // Restore active views back to its original value

        togglePlansComboBox(selector, true);
    }

    function formatCurrency(value) {
        return value.Code;
    }

    function numberFormat(val, decimalPlaces) {

        var multiplier = Math.pow(10, decimalPlaces);
        return (Math.round(val * multiplier) / multiplier).toFixed(decimalPlaces);
    }

    function formatCost(value, rowNumber, columnNumber, rowDefinition) {
        var dataContext = rowNumber.dataItem;

        return "{0} {1}".format(dataContext.Currency.Code, numberFormat(value, 2));
    }

    function formatMonth(value, rowNumber, columnNumber, rowDefinition)
    {
        var dataContext = rowNumber.dataItem;

        var monthNames = [
         "January", "February", "March",
         "April", "May", "June",
         "July", "August", "September",
         "October", "November", "December"
        ];

        return monthNames[dataContext.Month-1];
    }

    // Public
    function loadTab(extension, renderArea, initData) {

        //render resources for the html tabs
        $("#mainContainer").html(global.BillingTenantExtension.templates.billingRecordsTab.render(resources));
        renderListOfHostingOffers("#accountPlanDropDown");

        //declare the array to hold the subscription ids
        var subIds = [];

        //get subscriptions for Billing resource provider
        var susbscriptionIds = global.Exp.Rdfe.getSubscriptionsRegisteredToService("Billing");

        //iterate through the subscriptions array to get their ids
        susbscriptionIds.forEach(function (sub) {
            subIds.push(sub.id);
        });

        var subs = Exp.Rdfe.getSubscriptionList(),
         localDataSet,
         columns = [
              // { name: "Subscription", field: "SubscriptionId", filterable: true, sortable: true },
               { name: "Year", field: "Year", type: "int", filterable: true, sortable: true },
               { name: "Month", field: "Month", formatter: formatMonth, filterable: true, sortable: true },
               { name: "Price", field: "Cost", formatter: formatCost, filterable: false, sortable: true }
         ];

        var sid = $('#accountPlanDropDown').val();

        //get data for grid then render grid      
        global.BillingTenantExtension.Controller
            .getBillingRecords({ subscriptionId: sid })
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
                    $(".gridContainer").html(global.BillingTenantExtension.templates.billingRecordsTabEmpty.render(resources));
                }
            }
            );

        $('#accountPlanDropDown').change(function () {
            global.BillingTenantExtension.Controller.getBillingRecords({ subscriptionId: $('#accountPlanDropDown').val() })
			.done(
				function (p1, p2) {
				    localDataSet = p1;

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
				        $(".gridContainer").html(global.BillingTenantExtension.templates.billingRecordsTabEmpty.render(resources));
				    }


				});

        });
    }

    function cleanUp() {
        if (grid) {
            grid.wazObservableGrid("destroy");
            grid = null;
        }
    }

    global.BillingTenantExtension = global.BillingTenantExtension || {};
    global.BillingTenantExtension.BillingRecordsTab = {
        loadTab: loadTab,
        cleanUp: cleanUp,
        statusIcons: statusIcons
    };
})(jQuery, this);