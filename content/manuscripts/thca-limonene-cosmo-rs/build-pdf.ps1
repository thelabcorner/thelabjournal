# Two-column thelabjournal scientific manuscript build; restricted package acquisition.
# Does not edit source, register publication routes, or push/deploy.
$ErrorActionPreference = 'Continue' # MiKTeX writes routine privilege warnings to stderr; inspect exit code explicitly.
Set-Location $PSScriptRoot
$allow = @('geometry','booktabs','siunitx','caption','microtype','titlesec',
 'fancyhdr','lastpage','fontspec','amsmath','amsfonts','graphics','pgf',
 'pgfplots','xcolor','hyperref','infwarerr','ltxcmds','pdftexcmds',
 'kvsetkeys','kvdefinekeys','pdfescape','hycolor','intcalc','bigintcalc',
 'bitset','uniquecounter','letltxmacro','auxhook','rerunfilecheck',
 'refcount','atveryend','stringenc','atbegshi','bookmark','gettitlestring',
 'atbegshi-ltx','kvoptions','oberdiek','url','etoolbox','epstopdf','epsfig')
for($attempt=1;$attempt -le 25;$attempt++){
  Write-Output "Compilation attempt $attempt"
  $out = & xelatex --disable-installer -interaction=nonstopmode -halt-on-error -jobname=manuscript-draft manuscript.tex 2>&1 | Out-String
  if($LASTEXITCODE -eq 0){
    $out2 = & xelatex --disable-installer -interaction=nonstopmode -halt-on-error -jobname=manuscript-draft manuscript.tex 2>&1 | Out-String
    if($LASTEXITCODE -ne 0){Write-Output ($out2 -split "`n" | Select-Object -Last 35);throw "Second pass failed"}
    Write-Output "PDF_READY"; Get-Item manuscript-draft.pdf | Select-Object FullName,Length,LastWriteTime
    exit 0
  }
  $match = [regex]::Match($out,'File `([^''`]+\.sty)'' not found')
  if(-not $match.Success){
    Write-Output ($out -split "`n" | Select-Object -Last 48);throw "Compile failed: not a missing allowed package"
  }
  $pkg = [IO.Path]::GetFileNameWithoutExtension($match.Groups[1].Value)
  if($allow -notcontains $pkg){throw "Package not in build allowlist: $pkg"}
  Write-Output "Installing missing dependency: $pkg"
  & mpm "--install=$pkg" | Out-Null
  if($LASTEXITCODE -ne 0){throw "MiKTeX failed to install $pkg"}
}
throw "Maximum package installation attempts exhausted"
