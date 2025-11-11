@echo off
REM Script to push LeetSimplify to GitHub
REM Make sure you have created the repository on GitHub first!

echo ========================================
echo LeetSimplify - Push to GitHub
echo ========================================
echo.

REM Check if remote already exists
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo Remote 'origin' already exists.
    git remote -v
    echo.
    echo Do you want to update it? (y/n)
    set /p update="> "
    if /i "%update%"=="y" (
        git remote set-url origin https://github.com/JayeshVegda/LeetSimplify.git
        echo Remote URL updated.
    )
) else (
    echo Adding remote 'origin'...
    git remote add origin https://github.com/JayeshVegda/LeetSimplify.git
    echo Remote added.
)

echo.
echo ========================================
echo Current Status:
echo ========================================
git status --short
echo.

echo ========================================
echo Recent Commits:
echo ========================================
git log --oneline -5
echo.

echo ========================================
echo Ready to push to GitHub!
echo ========================================
echo.
echo Repository: https://github.com/JayeshVegda/LeetSimplify
echo Branch: main
echo.
pause

echo.
echo Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Repository pushed to GitHub!
    echo ========================================
    echo.
    echo Visit: https://github.com/JayeshVegda/LeetSimplify
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Push failed!
    echo ========================================
    echo.
    echo Possible reasons:
    echo 1. Repository doesn't exist on GitHub yet
    echo 2. Authentication failed (check your credentials)
    echo 3. Network connection issue
    echo.
    echo Make sure you:
    echo - Created the repository on GitHub first
    echo - Have proper authentication set up
    echo - Have internet connection
    echo.
)

pause

