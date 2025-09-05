# fix-routes.ps1
$routes = Get-ChildItem -Recurse -Path .\app\api -File |
  Where-Object { $_.Name -match '^route\.tsx?$' }

foreach ($f in $routes) {
  $content = Get-Content -LiteralPath $f.FullName -Raw

  $needsRuntime = -not ($content -match 'export\s+const\s+runtime\s*=\s*["'']nodejs["'']')
  $needsDynamic = -not ($content -match 'export\s+const\s+dynamic\s*=\s*["'']force-dynamic["'']')

  if ($needsRuntime -or $needsDynamic) {
    $header = ""
    if ($needsRuntime) { $header += "export const runtime = `"nodejs`";`r`n" }
    if ($needsDynamic) { $header += "export const dynamic = `"force-dynamic`";`r`n" }

    # insert after contiguous import lines if present, else prepend
    if ($content -match '^(?:import .+\r?\n)+') {
      $content = $content -replace '^(?:import .+\r?\n)+', ('$0' + $header)
    } else {
      $content = $header + $content
    }

    Set-Content -LiteralPath $f.FullName -Value $content -NoNewline
    Write-Host ("Patched: {0}" -f $f.FullName)
  }
}

Write-Host "Done."