# Windows PowerShell Script to validate Windows Azure Pack (WAP) manifest.
# Copyright (c) Microsoft Corporation. All rights reserved.
# 26-May-2015 Test-WapManifest.ps1
# Support link: http://go.microsoft.com/?linkid=9832687

#requires -version 4.0

param([string]$manifestFile, [string]$contentFolder)

Write-Verbose -Message "$($MyInvocation.MyCommand.Name) -manifestFile '$manifestFile' -contentFolder '$contentFolder'" -Verbose

#-------------------------------------------------------------------------------
# Test cases

function Test-WapManifestFileReference([string]$name, [string]$src, [string]$contentFolder)
{
    $testResult = [PSCustomObject]@{
        Name = $name
        Detail = $src
        Result = "UNKNOWN" # (PASS | FAIL)
    }

    $file = $src.Replace("~", $contentFolder)
    $exists = Test-Path -Path $file -PathType Leaf
    if ($exists)
    {
        $testResult.Result = "PASS"
    }
    else
    {
        $testResult.Result = "FAIL"
    }

    return $testResult
}

#-------------------------------------------------------------------------------
# Main

$testResults = @()

try
{
    # <uiManifest>
    $manifest = [xml](Get-Content -Path $manifestFile)

    # <uiManifest>/<extension>/<scripts>/<script src="..." />
    foreach ($script in $manifest.uiManifest.extension.scripts.script)
    {
        $testResults += Test-WapManifestFileReference -name "Check manifest script reference" -src $script.src -contentFolder $contentFolder
    }

    # <uiManifest>/<extension>/<stylesheets>/<stylesheet src="..." />
    foreach ($stylesheet in $manifest.uiManifest.extension.stylesheets.stylesheet)
    {
        $testResults += Test-WapManifestFileReference -name "Check manifest stylesheet reference" -src $stylesheet.src -contentFolder $contentFolder
    }

    # <uiManifest>/<extension>/<templates>/<template name="..." src="..." />
    foreach ($template in $manifest.uiManifest.extension.templates.template)
    {
        $testResults += Test-WapManifestFileReference -name "Check manifest template reference" -src $template.src -contentFolder $contentFolder
    }
}
finally
{
    Write-Host "================================================================================"
    Write-Host "Test results:"
    Write-Host $($testResults | Format-Table -AutoSize | Out-String)
    if ($testResults.Result -icontains "FAIL") { exit 1 }
}
