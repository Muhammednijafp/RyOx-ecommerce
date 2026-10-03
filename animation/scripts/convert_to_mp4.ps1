$FFMPEG = "C:\Users\pc\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffmpeg.exe"

$INPUT = "..\output\frames\ryox_%04d.png"

$OUTPUT = "..\output\ryox-header.mp4"

& $FFMPEG `
    -y `
    -framerate 30 `
    -i $INPUT `
    -c:v libx264 `
    -preset medium `
    -crf 18 `
    -pix_fmt yuv420p `
    -movflags +faststart `
    $OUTPUT

if ($LASTEXITCODE -eq 0) {

    Write-Host ""
    Write-Host "============================================"
    Write-Host "       RYOX MP4 CREATED SUCCESSFULLY"
    Write-Host "============================================"
    Write-Host ""
    Write-Host "Video:"
    Write-Host $OUTPUT
    Write-Host ""
}
else {

    Write-Host ""
    Write-Host "============================================"
    Write-Host "          RYOX MP4 CREATION FAILED"
    Write-Host "============================================"
    Write-Host ""
}