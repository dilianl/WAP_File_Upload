/*globals window,jQuery,cdm,UploadTenantExtension,waz,Exp*/
(function ($, global, undefined) {
    "use strict";

    var baseUrl = "/UploadTenant",
        listUploadRecordsUrl = baseUrl + "/ListUploadRecords",
        deleteUploadRecordUrl = baseUrl + "/DeleteUploadRecord",
        getShareUrl = baseUrl + "/GetStorageShare?subscriptionId={0}&userId={1}",
        uploadFileUrl = baseUrl + "/UploadStorageFile?subscriptionId={0}&fileSharePath={1}&shareId={2}",
        domainType = "Upload";

    function navigateToListView() {
        Shell.UI.Navigation.navigate("#Workspaces/{0}/Billing".format(BillingTenantExtension.name));
    }

    function deleteUploadRecord(subscriptionId, selectedId) {
        var url = deleteUploadRecordUrl;
        return makeAjaxCall(deleteUploadRecordUrl, { subscriptionId: subscriptionId, id: selectedId });      
    }

    function getUploadRecords(data) {
        return makeAjaxCall(listUploadRecordsUrl, data);
    }
    
    function makeAjaxCall(url, data) {
        return Shell.Net.ajaxPost({
            url: url,
            data: data
        });
    }

    function makeAjaxCallTest(url, data) {
        return Shell.Net.ajaxPost({
            contentType: false,
            processData: false,
            url: url,
            data: data
        });
    }


    function UploadFile(TargetFile, subscriptionId, fileSharePath, shareId) {
       
        // create array to store the buffer chunks
        var FileChunk = [];
        // the file object itself that we will work with
        var file = TargetFile[0];
        // set up other initial vars
        var MaxFileSizeMB = 3.99;
        var BufferChunkSize = MaxFileSizeMB * (1024 * 1024);
        //var ReadBuffer_Size = 1024;
        var FileStreamPos = 0;
        // set the initial chunk length
        var EndPos = BufferChunkSize;
        var Size = file.size;

        // add to the FileChunk array until we get to the end of the file
        while (FileStreamPos < Size) {
            // "slice" the file from the starting position/offset, to  the required length
            FileChunk.push(file.slice(FileStreamPos, EndPos));
            FileStreamPos = EndPos; // jump by the amount read
            EndPos = FileStreamPos + BufferChunkSize; // set next chunk length
        }
        // get total number of "files" we will be sending
        var TotalParts = FileChunk.length;
        var PartCount = 0;
        // loop through, pulling the first item from the array each time and sending it
        var chunk;
        //var procent = 0;
        var FilePartName;

        while (chunk = FileChunk.shift()) {
            PartCount++;
            // file name convention
            FilePartName = file.name + ".part_" + PartCount + "." + TotalParts;
            // send the file
            UploadFileChunk(chunk, FilePartName, subscriptionId, file.name, fileSharePath, shareId);
        }
    }

    function UploadFileChunk(Chunk, FileName, subscriptionId, fileOriginalName, fileSharePath,shareId) {
        var _deferred = $.Deferred();
        var FD = new FormData();
        FD.append('file', Chunk, FileName);
        var url = uploadFileUrl.format(subscriptionId, fileSharePath, shareId);
        var status;
        $.ajax({
            type: "POST",
            url: url,
            contentType: false,
            processData: false,
            data: FD,
            success: function (result) {
                if (result.data == 100) {
                    status = "Successfully uploaded  file {0}".format(fileOriginalName);
                    global.UploadTenantExtension.UploadRecordsTab.forceRefreshData();
                    _deferred.resolve(result.data);
                }
                else {
                    status = "Uploading file {0} {1}%".format(fileOriginalName, result.data);
                }

                $(".fxs-progressbox-header").text(status);
            },
            error: function (result) {
                status = "Failed to upload file {0}. Please wait for reconect.".format(fileOriginalName);
                $(".fxs-progressbox-header").text(status);
                UploadFileChunk(Chunk, FileName, subscriptionId, fileOriginalName, fileSharePath,shareId);
                _deferred.reject(result);
            }
        });
    }

    function uploadFileAsync(formSelector, subscriptionId) {
        var _deferred = $.Deferred();
        var files = $('#uploadImageFile')[0].files;
        var size = files[0].size / Math.pow(1024, 3);
        var freeSapce;

        var userId = $("div.fxs-avatarbar span").text();
        var url = getShareUrl.format(subscriptionId, userId);
        
        console.log("User Id", userId);
        console.log("Share url", url);
        $.ajax({
            type: "POST",
            url: url,
            success: function (result) {
                freeSapce = result.data.FreeSpace;
                if (freeSapce >= size) {
                  var status = UploadFile(files, subscriptionId, result.data.NetworkSharePath, result.data.ShareId);
                }
                
                _deferred.resolve(status);
            },
            error: function (result) {
                
                _deferred.reject(result);
            }
        });
        
       return _deferred.promise();
    }

    global.UploadTenantExtension = global.UploadTenantExtension || {};
    global.UploadTenantExtension.Controller = {
        listUploadRecordsUrl: listUploadRecordsUrl,
        getUploadRecords: getUploadRecords,
        deleteUploadRecord: deleteUploadRecord,
        navigateToListView: navigateToListView,
        uploadFileAsync: uploadFileAsync
    };
})(jQuery, this);
