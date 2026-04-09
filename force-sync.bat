@echo off
echo 🚀 FORCING SYNC AND RESOLVING CONFLICTS...

:: Step 1: Set identity again just to be sure
git config user.email "yasir@example.com"
git config user.name "YASIR SHAH"

:: Step 2: Abort any stuck rebase or merge
echo 🛑 Aborting previous failed syncs...
git rebase --abort >nul 2>&1
git merge --abort >nul 2>&1

:: Step 3: Force the branch to match local exactly
echo 🔄 Resetting branch...
git branch -M main

:: Step 4: Add and Commit local state
echo 📦 Staging all files...
git add .
git commit -m "Clipper Final Sync: %date% %time%"

:: Step 5: Force Push to GitHub (This overwrites remote history with your local high-end version)
echo 📤 Force pushing to GitHub (Overwriting conflicts)...
git push -u origin main --force

echo.
echo ✅ SUCCESS! CONFLICTS RESOLVED.
echo Your local files are now the source of truth on GitHub.
echo You can use sync.bat for all future normal updates.
pause
