# AccessPortal — Chrome Web Store assets (screenshots 1280x800 + promo tiles)
param(
  [string]$IconPath = "$PSScriptRoot\..\public\icons\icon128.png",
  [string]$OutScreenshots = "$PSScriptRoot\..\store-assets\screenshots",
  [string]$OutPromo = "$PSScriptRoot\..\store-assets\promo"
)

Add-Type -AssemblyName System.Drawing

function Save-Png {
  param([System.Drawing.Bitmap]$Bmp, [string]$Path)
  $Bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Save-Jpeg {
  param([System.Drawing.Bitmap]$Bmp, [string]$Path, [long]$Quality = 92)
  $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
  $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, $Quality)
  $Bmp.Save($Path, $enc, $encParams)
}

function New-GradientBrush {
  param([int]$W, [int]$H)
  $rect = New-Object System.Drawing.Rectangle 0, 0, $W, $H
  return New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, `
    ([System.Drawing.Color]::FromArgb(255, 102, 126, 234)), `
    ([System.Drawing.Color]::FromArgb(255, 118, 75, 162)), `
    ([System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
}

function Draw-RoundedRect {
  param(
    [System.Drawing.Graphics]$G,
    [int]$X, [int]$Y, [int]$W, [int]$H,
    [int]$R,
    [System.Drawing.Color]$Fill,
    [System.Drawing.Color]$BorderColor,
    [switch]$DrawBorder
  )
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($X, $Y, $R, $R, 180, 90)
  $path.AddArc($X + $W - $R, $Y, $R, $R, 270, 90)
  $path.AddArc($X + $W - $R, $Y + $H - $R, $R, $R, 0, 90)
  $path.AddArc($X, $Y + $H - $R, $R, $R, 90, 90)
  $path.CloseFigure()
  $G.FillPath((New-Object System.Drawing.SolidBrush $Fill), $path)
  if ($DrawBorder) {
    $pen = New-Object System.Drawing.Pen($BorderColor, 1)
    $G.DrawPath($pen, $path)
    $pen.Dispose()
  }
  $path.Dispose()
}

function Draw-TextLines {
  param(
    [System.Drawing.Graphics]$G,
    [int]$X, [int]$Y, [int]$MaxW,
    [string[]]$Lines,
    [System.Drawing.Font]$Font,
    [System.Drawing.Brush]$Brush
  )
  $G.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $lineH = [int][Math]::Round($Font.GetHeight($G) * 1.35)
  $cy = $Y
  foreach ($line in $Lines) {
    $G.DrawString($line, $Font, $Brush, $X, $cy)
    $cy += $lineH
  }
}

function New-Screenshot {
  param(
    [string]$Path,
    [string]$Title,
    [string]$Subtitle,
    [string[]]$Bullets,
    [string]$Badge = ''
  )

  $sw = 1280; $sh = 800
  $bmp = New-Object System.Drawing.Bitmap $sw, $sh
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $brush = New-GradientBrush $sw 120
  $g.FillRectangle($brush, 0, 0, $sw, 120)
  $brush.Dispose()

  $white = [System.Drawing.Brushes]::White
  $titleFont = New-Object System.Drawing.Font 'Segoe UI', 32, ([System.Drawing.FontStyle]::Bold)
  $subFont = New-Object System.Drawing.Font 'Segoe UI', 16, ([System.Drawing.FontStyle]::Regular)
  $g.DrawString('AccessPortal', $titleFont, $white, 48, 36)
  $g.DrawString('Adaptive accessibility · On-device AI · by AI4Context', $subFont, $white, 48, 78)
  $titleFont.Dispose(); $subFont.Dispose()

  Draw-RoundedRect -G $g -X 48 -Y 150 -W 1184 -H 610 -R 16 `
    -Fill ([System.Drawing.Color]::White) `
    -BorderColor ([System.Drawing.Color]::FromArgb(255, 233, 236, 239)) `
    -DrawBorder

  $hFont = New-Object System.Drawing.Font 'Segoe UI', 28, ([System.Drawing.FontStyle]::Bold)
  $bFont = New-Object System.Drawing.Font 'Segoe UI', 18, ([System.Drawing.FontStyle]::Regular)
  $muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 108, 117, 125))
  $dark = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 33, 37, 41))
  $accent = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 102, 126, 234))

  $g.DrawString($Title, $hFont, $accent, 88, 188)
  $g.DrawString($Subtitle, $bFont, $muted, 88, 238)

  $y = 290
  foreach ($bullet in $Bullets) {
    Draw-RoundedRect -G $g -X 88 -Y $y -W 1080 -H 52 -R 10 `
      -Fill ([System.Drawing.Color]::FromArgb(255, 248, 249, 250))
    $g.DrawString([char]0x2022 + ' ' + $bullet, $bFont, $dark, 104, ($y + 12))
    $y += 64
  }

  if ($Badge) {
    $badgeFont = New-Object System.Drawing.Font 'Segoe UI', 12, ([System.Drawing.FontStyle]::Bold)
    Draw-RoundedRect -G $g -X 88 -Y ($sh - 110) -W 420 -H 36 -R 18 `
      -Fill ([System.Drawing.Color]::FromArgb(255, 232, 236, 255))
    $g.DrawString($Badge, $badgeFont, $accent, 104, ($sh - 102))
    $badgeFont.Dispose()
  }

  if (Test-Path $IconPath) {
    $icon = [System.Drawing.Image]::FromFile($IconPath)
    $g.DrawImage($icon, ($sw - 120), 24, 72, 72)
    $icon.Dispose()
  }

  $hFont.Dispose(); $bFont.Dispose(); $muted.Dispose(); $dark.Dispose(); $accent.Dispose()
  $g.Dispose()
  Save-Png -Bmp $bmp -Path $Path
  $bmp.Dispose()
}

New-Item -ItemType Directory -Force -Path $OutScreenshots | Out-Null
New-Item -ItemType Directory -Force -Path $OutPromo | Out-Null

New-Screenshot -Path (Join-Path $OutScreenshots 'AccessPortal-screenshot-1-popup-1280x800.png') `
  -Title 'Extension popup' `
  -Subtitle 'Send page text or selection to the AccessPortal PWA.' `
  -Bullets @(
    'Open AccessPortal PWA in a new tab',
    'Use this page — visible text after on-page confirmation',
    'Use selection — highlighted text only',
    'English / Spanish UI'
  ) `
  -Badge 'Chrome 148+ desktop · Gemini Nano on-device'

New-Screenshot -Path (Join-Path $OutScreenshots 'AccessPortal-screenshot-2-cognitive-1280x800.png') `
  -Title 'Cognitive profile' `
  -Subtitle 'Summarize and simplify content you paste or attach.' `
  -Bullets @(
    'Key-point summaries from pasted text or PDF/txt/md files',
    'Easy-read simplification for selected passages',
    'History stored locally on this device (IndexedDB)',
    'OpenDyslexic-friendly typography option'
  ) `
  -Badge 'Private · No AI4Context server upload'

New-Screenshot -Path (Join-Path $OutScreenshots 'AccessPortal-screenshot-3-visual-1280x800.png') `
  -Title 'Visual profile' `
  -Subtitle 'Describe images locally for screen readers.' `
  -Bullets @(
    'Upload or capture an image',
    'Multimodal Gemini Nano description on-device',
    'Results announced via aria-live regions',
    'Copy or download the description'
  ) `
  -Badge 'Complements — does not replace — professional OCR'

New-Screenshot -Path (Join-Path $OutScreenshots 'AccessPortal-screenshot-4-motor-1280x800.png') `
  -Title 'Motor profile' `
  -Subtitle 'Dictate and structure an internal accessibility note.' `
  -Bullets @(
    'Web Speech API dictation (browser/OS may use cloud STT)',
    'Fill title + body form with local AI structuring',
    'Large buttons and keyboard-friendly flows',
    'Does not autofill external website forms'
  ) `
  -Badge 'Internal form only — not third-party autofill'

# --- Promo small 440x280 ---
$sw = 440; $sh = 280
$small = New-Object System.Drawing.Bitmap $sw, $sh
$gs = [System.Drawing.Graphics]::FromImage($small)
$gs.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$brushS = New-GradientBrush $sw $sh
$gs.FillRectangle($brushS, 0, 0, $sw, $sh)
$brushS.Dispose()

if (Test-Path $IconPath) {
  $icon = [System.Drawing.Image]::FromFile($IconPath)
  $gs.DrawImage($icon, 28, 92, 96, 96)
  $icon.Dispose()
}

$titleFont = New-Object System.Drawing.Font 'Segoe UI', 26, ([System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font 'Segoe UI', 12, ([System.Drawing.FontStyle]::Regular)
$tagFont = New-Object System.Drawing.Font 'Segoe UI', 10, ([System.Drawing.FontStyle]::Regular)
$white = [System.Drawing.Brushes]::White
$soft = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(235, 255, 255, 255))
$gs.DrawString('AccessPortal', $titleFont, $white, 136, 86)
$gs.DrawString('Adaptive web accessibility', $subFont, $soft, 136, 122)
$gs.DrawString('Private · On-device · Chrome AI', $tagFont, $soft, 136, 148)
$titleFont.Dispose(); $subFont.Dispose(); $tagFont.Dispose(); $soft.Dispose()
$gs.Dispose()
$smallOut = Join-Path $OutPromo 'AccessPortal-promo-small-440x280.jpg'
Save-Jpeg -Bmp $small -Path $smallOut
$small.Dispose()

# --- Promo marquee 1400x560 ---
$mw = 1400; $mh = 560
$marquee = New-Object System.Drawing.Bitmap $mw, $mh
$gm = [System.Drawing.Graphics]::FromImage($marquee)
$gm.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$brushM = New-GradientBrush $mw $mh
$gm.FillRectangle($brushM, 0, 0, $mw, $mh)
$brushM.Dispose()

if (Test-Path $IconPath) {
  $icon2 = [System.Drawing.Image]::FromFile($IconPath)
  $gm.DrawImage($icon2, 72, 148, 128, 128)
  $icon2.Dispose()
}

$titleFont2 = New-Object System.Drawing.Font 'Segoe UI', 52, ([System.Drawing.FontStyle]::Bold)
$subFont2 = New-Object System.Drawing.Font 'Segoe UI', 22, ([System.Drawing.FontStyle]::Regular)
$tagFont2 = New-Object System.Drawing.Font 'Segoe UI', 16, ([System.Drawing.FontStyle]::Regular)
$white2 = [System.Drawing.Brushes]::White
$soft2 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(235, 255, 255, 255))
$gm.DrawString('AccessPortal', $titleFont2, $white2, 230, 132)
$gm.DrawString('Make web content more accessible in Chrome', $subFont2, $soft2, 230, 200)
$gm.DrawString('Summarize · Easy read · Describe images · Motor notes', $tagFont2, $soft2, 230, 248)
$titleFont2.Dispose(); $subFont2.Dispose(); $tagFont2.Dispose(); $soft2.Dispose()

$shot1 = Join-Path $OutScreenshots 'AccessPortal-screenshot-2-cognitive-1280x800.png'
if (Test-Path $shot1) {
  $shot = [System.Drawing.Image]::FromFile($shot1)
  $frameW = 760; $frameH = 470; $frameX = 590; $frameY = 45
  $scale = [Math]::Max($frameW / $shot.Width, $frameH / $shot.Height)
  $drawW = [int][Math]::Round($shot.Width * $scale)
  $drawH = [int][Math]::Round($shot.Height * $scale)
  $dx = $frameX + [int][Math]::Round(($frameW - $drawW) / 2)
  $dy = $frameY + [int][Math]::Round(($frameH - $drawH) / 2)
  $clip = New-Object System.Drawing.Drawing2D.GraphicsPath
  $clipRect = New-Object System.Drawing.Rectangle $frameX, $frameY, $frameW, $frameH
  $clip.AddArc($clipRect.X, $clipRect.Y, 24, 24, 180, 90)
  $clip.AddArc($clipRect.Right - 24, $clipRect.Y, 24, 24, 270, 90)
  $clip.AddArc($clipRect.Right - 24, $clipRect.Bottom - 24, 24, 24, 0, 90)
  $clip.AddArc($clipRect.X, $clipRect.Bottom - 24, 24, 24, 90, 90)
  $clip.CloseFigure()
  $gm.SetClip($clip)
  $gm.DrawImage($shot, $dx, $dy, $drawW, $drawH)
  $gm.ResetClip()
  $gm.DrawPath((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120, 255, 255, 255), 2)), $clip)
  $shot.Dispose(); $clip.Dispose()
}

$byFont = New-Object System.Drawing.Font 'Segoe UI', 14, ([System.Drawing.FontStyle]::Regular)
$gm.DrawString('by AI4Context', $byFont, (New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(210, 255, 255, 255))), 72, 470)
$byFont.Dispose()
$gm.Dispose()
$marqueeOut = Join-Path $OutPromo 'AccessPortal-promo-marquee-1400x560.jpg'
Save-Jpeg -Bmp $marquee -Path $marqueeOut
$marquee.Dispose()

Write-Output "Wrote screenshots to $OutScreenshots"
Write-Output "Wrote $smallOut"
Write-Output "Wrote $marqueeOut"
