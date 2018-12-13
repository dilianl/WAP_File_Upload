/*globals window,jQuery,UploadTenantExtension,Exp,waz,cdm*/
(function ($, global, undefined) {
    "use strict";

    var resources = global.Resources.getResources("BCP.Upload.TenantExtension.UploadTenantResources");
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

    function updateContextualCommands(domain) {
        Exp.UI.Commands.Contextual.clear();
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

        //var listOfPlans = global.Exp.Rdfe.getSubscriptionsRegisteredToService("Billing");
        var listOfPlans = global.Exp.Rdfe.getSubscriptionList();

        var options, plansDropDown = $(selector);

        // Combining jsrender html-encoding and custom attribute encoding together {{>UnambiguousSubscriptionName}}
        options = $.templates("<option value=\"{{attr:id}}\">{{>OfferFriendlyName}} {{>id}}</option>").render(listOfPlans);
        plansDropDown.append(options);

        togglePlansComboBox(selector, true);
    }

    function formatBillingPrice(value, rowNumber, columnNumber, rowDefinition) {
        var dataContext = rowNumber.dataItem;

        return "{0} {1}/{2}".format(dataContext.Currency, value, dataContext.UnitOfMeasurement);
    }

    function numberFormat(val, decimalPlaces) {
        if (val == "NAN" || val == null ) return "-";
        var multiplier = Math.pow(10, decimalPlaces);
        return (Math.round(val * multiplier) / multiplier).toFixed(decimalPlaces);
    }

    function getCurrentMonth()
    {
        var monthNames = [
         "January", "February", "March",
         "April", "May", "June",
         "July", "August", "September",
         "October", "November", "December"
        ];
        var today = new Date();
        return monthNames[today.getMonth()];
    }

    function formatCost(value, rowNumber, columnNumber, rowDefinition) {
        var dataContext = rowNumber.dataItem;

        return "{0} {1}".format(dataContext.Currency, numberFormat(value,2));
    }

    function formatDecimal(value, rowNumber, columnNumber, rowDefinition)
    {
        return "{0}".format(numberFormat(value, 2));
    }

    // Public
    function loadTab(extension, renderArea, initData) {
       

        //render resources for the html tabs
        $("#mainCurrentBillingContainer").html(global.BillingTenantExtension.templates.billingCurrentTab.render(resources));

        renderListOfHostingOffers("#accountPlanDropDownCurrent");

        var subs = Exp.Rdfe.getSubscriptionList(),
        localDataSet,
        columns = [
              { name: "Resourse Name", field: "Vm", filterable: false, sortable: true },
              { name: "Period From", field: "PeriodFrom", formatter: $.fxGridFormatter.date("G"), filterable: false, sortable: false },
              { name: "Period To", field: "PeriodTo", formatter: $.fxGridFormatter.date("G"), filterable: false, sortable: false },
              { name: "vCPUs", field: "Cores", formatter: formatDecimal, filterable: false, sortable: true },
              { name: "Memory (GB)", field: "Memory", formatter: formatDecimal, filterable: false, sortable: true },
              { name: "DiskSpace (GB)", field: "DiskSpace", formatter: formatDecimal, filterable: false, sortable: true },             
              { name: "Hours (Machine running)", field: "ComputeUsage", formatter: formatDecimal, filterable: false, sortable: true },
              { name: "Hours Total", field: "StorageUsage", formatter: formatDecimal, filterable: false, sortable: true }
        ];

        var sid = $('#accountPlanDropDownCurrent').val();

        //get data for grid then render grid      
        global.BillingTenantExtension.Controller
              .getBillingCurrentDetailedRecords({ subscriptionId: sid })
              .done(
                    function (r1, r2) {

      

                    //assign responseText to localDataSet variable
                    localDataSet = r1.data.BillingRecords;

                    //display empty template if no records are fetched
                    if (localDataSet.length > 0) {
                        $('#totalCost').text("Current month: {0}".format(getCurrentMonth()));
                        //call grid once the data is fetched
                        grid = renderArea.find(".gridContainerCurrent")
                      .wazObservableGrid("destroy")
                      .wazObservableGrid({
                          lastSelectedRow: null,
                          data: localDataSet,
                          keyField: "id",
                          columns: columns,
                          fastPollingOnDataSet: false,
                          gridOptions: {
                              rowSelect: onRowSelected
                          }
                      });
                    }
                    else {
                        $(".gridContainerCurrent").html(global.BillingTenantExtension.templates.billingRecordsTabEmpty.render(resources));
                    }
                }
                );

        $('#accountPlanDropDownCurrent').change(function () {
            global.BillingTenantExtension.Controller.getBillingCurrentDetailedRecords({ subscriptionId: $('#accountPlanDropDownCurrent').val() })
			.done(
				function (p1, p2) {
				    localDataSet = p1.data.BillingRecords;

				    //display empty template if no records are fetched
				    if (localDataSet.length > 0) {

				        $('#totalCost').text("Current month: {0}".format(getCurrentMonth()));
				        //call grid once the data is fetched
				        grid = renderArea.find(".gridContainerCurrent")
						  .wazObservableGrid("destroy")
						  .wazObservableGrid({
						      lastSelectedRow: null,
						      data: localDataSet,
						      keyField: "id",
						      columns: columns,
						      fastPollingOnDataSet: false,
						      gridOptions: {
						          rowSelect: onRowSelected
						      }
						  });
				    }
				    else {
				        $(".gridContainerCurrent").html(global.BillingTenantExtension.templates.billingRecordsTabEmpty.render(resources));
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

    global.UploadTenantExtension = global.UploadTenantExtension || {};
    global.UploadTenantExtension.UploadCurrentTab = {
        loadTab: loadTab,
        cleanUp: cleanUp,
        statusIcons: statusIcons
    };
})(jQuery, this);
