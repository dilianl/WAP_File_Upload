/// <reference path="../../scripts/_references.js" />
/*globals Exp,fx,waz,StorageSampleAdminExtension*/
/// <dictionary>runbook,runbooks,Runbook,Runbooks</dictionary>

(function ($, global, shell, exp, resources, constants, undefined) {
    "use strict";

    var createAssetImpl,
        //validation = StorageSampleAdminExtension.Validation,
        controller = StorageAdminExtension.Controller;

    function renderListOfUsers(selector) {

        //var listOfPlans = global.Exp.Rdfe.getSubscriptionsRegisteredToService("Billing");
        var listOfUsers = /*global.Exp.Rdfe.ListUsers(); */ StorageAdminExtension.Controller.getAllUsers();// global.Exp.Rdfe.getSubscriptionsRegisteredToService("Upload"); //global.Exp.Rdfe.getSubscriptionList();

        //declare the array to hold the subscription ids
        var userList = [];

       
        //iterate through the subscriptions array to get their ids
        //listOfUsers.forEach(function (user) {
        //    userList.push(user.Name);
        //});

        listOfUsers.then(function (response) {
            console.log("List users", response.data);

            var options, usersDropDown = $(selector);

            // Combining jsrender html-encoding and custom attribute encoding together {{>UnambiguousSubscriptionName}}
            options = $.templates("<option value=\"{{attr:Name}}\">{{>Name}}</option>").render(response.data);
            usersDropDown.append(options);
        });

        

       

        //togglePlansComboBox(selector, true);
    }

    function createStorageShare(name, totalSpace, networkSharePath, userId) {
        /// <summary>
        /// Creates the runbook using the provided parameter values.
        /// </summary>
        /// <param name="name" type="Object" maybeNull="false" optional="false">
        /// Runbook name.
        /// </param>
        /// <param name="description" type="Object" maybeNull="false" optional="false">
        /// Runbook description.
        /// </param>
        /// <param name="tags" type="Object" maybeNull="false" optional="false">
        /// Tags associated with the runbook.
        /// </param>

        //validation.throwIfStringNullOrEmpty(name, "name");

        var data = { };
        data.ShareName = name;
        data.TotalSpace = totalSpace;
        data.NetworkSharePath = networkSharePath;
        data.UserName = userId;
        var promise = StorageAdminExtension.Controller.makeAjaxCall(StorageAdminExtension.Controller.adminShareCreateUrl, data);

        global.waz.interaction.showProgress(
            promise,
            {
                initialText: "Creating storage share '" + name + "'.",
                successText: "Successfully created storage share '" + name + "'.",
                failureText: "Failed to create storage share '" + name + "'."
            }
        );

        promise.done(function () {
        });
        promise.always(function () {
            StorageAdminExtension.SharesTab.forceRefreshSharesData();
        });

        return promise.promise();
    }

    shell.Namespace.define("StorageAdminExtension.Actions", {
        createStorageShare: createStorageShare,
        renderListOfUsers: renderListOfUsers
    });
})(jQuery, this, Shell, Exp, StorageAdminExtension.Resources, StorageAdminExtension.Constants);
