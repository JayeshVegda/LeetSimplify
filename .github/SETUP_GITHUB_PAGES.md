# Enable GitHub Pages

## Steps to Enable GitHub Pages

1. **Go to Repository Settings**
   - Navigate to https://github.com/JayeshVegda/LeetSimplify/settings/pages

2. **Configure Source**
   - Under "Source", select **"GitHub Actions"**
   - This will use the workflow in `.github/workflows/pages.yml`

3. **Save**
   - The workflow will automatically build and deploy your site
   - Your site will be available at: `https://jayeshvegda.github.io/LeetSimplify/`

## What Happens Next

- The GitHub Actions workflow will automatically run on every push to `main`
- The documentation site will be built from `docs/index.html`
- The site will be deployed to GitHub Pages
- You can view it at the URL above

## Verify

1. Check the Actions tab: https://github.com/JayeshVegda/LeetSimplify/actions
2. Look for the "GitHub Pages" workflow
3. Once it completes, visit your site URL

## Note

If you want to use a custom domain, you can configure it in the Pages settings after enabling GitHub Pages.

