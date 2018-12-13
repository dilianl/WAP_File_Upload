@setlocal
set SOURCEDIR=C:\inetpub\MgmtSvc-AdminSite\bin
copy /y "%SOURCEDIR%\Microsoft.Azure.Portal.Configuration.dll" .
copy /y "%SOURCEDIR%\Microsoft.Azure.Portal.ExtensionCore.dll" .
copy /y "%SOURCEDIR%\Microsoft.Portal.Core.dll" .
copy /y "%SOURCEDIR%\Microsoft.WindowsAzure.Management.Common.HttpClient.dll" .
@endlocal
