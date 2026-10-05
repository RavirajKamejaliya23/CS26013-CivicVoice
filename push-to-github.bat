@echo off
set "PATH=C:\Program Files\Microsoft Visual Studio\18\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd;%PATH%"
echo ===================================================
echo   CivicVoice - Push to GitHub Repository
echo   Remote: https://github.com/RavirajKamejaliya23/CS26013-CivicVoice.git
echo ===================================================
git push origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Project successfully pushed to GitHub!
) else (
    echo.
    echo [ERROR] Push failed. If prompted for GitHub login, please sign in via your browser.
)
pause
