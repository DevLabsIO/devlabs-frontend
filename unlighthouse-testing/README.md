# Unlighthouse Testing Setup

This directory contains the configuration and scripts for running Unlighthouse performance audits on the DevLabs application.

## Overview

Unlighthouse performs comprehensive Lighthouse audits across all pages of your application, with support for authenticated sessions via Keycloak for role-based testing.

## Prerequisites

1. **Node 20+** installed
2. Application running in production mode at `http://localhost:3000`
3. Valid user credentials for each role (admin, manager, staff, student)

## Quick Start

1. **Build and start your Next.js app in production mode:**

    ```bash
    npm run build
    npx next start -p 3000
    ```

    Keep this terminal running.

2. **Run tests for a specific role** (in a new terminal):

    ```bash
    # For bash (Git Bash on Windows, Linux, macOS)
    cd unlighthouse-testing
    ./run-tests.sh admin

    # For PowerShell
    cd unlighthouse-testing
    .\run-tests.ps1 admin
    ```

3. **View results** in the browser that opens automatically, or generate static reports.

## Files in this Directory

- `unlighthouse.config.ts` - Main configuration file
- `run-tests.sh` - Bash script for running tests
- `run-tests.ps1` - PowerShell script for running tests
- `role-routes.json` - Role-specific URL mappings
- `README.md` - This file
- `reports/` - Generated test reports (created automatically)

## Running Tests

### Individual Role Test

**Bash:**

```bash
./run-tests.sh admin
./run-tests.sh manager
./run-tests.sh staff
./run-tests.sh student
```

**PowerShell:**

```powershell
.\run-tests.ps1 admin
.\run-tests.ps1 manager
.\run-tests.ps1 staff
.\run-tests.ps1 student
```

### All Roles Sequentially

**Bash:**

```bash
./run-tests.sh all
```

**PowerShell:**

```powershell
.\run-tests.ps1 all
```

### Generate Static Reports

**Bash:**

```bash
./run-tests.sh admin --static
```

**PowerShell:**

```powershell
.\run-tests.ps1 admin -Static
```

## Configuration

### Credentials

Default credentials are stored in the scripts:

- Admin: `admin` / `1234`
- Manager: `manager` / `1234`
- Staff: `staff` / `1234`
- Student: `student` / `1234`

To use different credentials, modify the scripts or set environment variables:

```bash
KC_USERNAME=myuser KC_PASSWORD=mypass ROLE=admin npx unlighthouse
```

### Role Routes

Edit `role-routes.json` to customize which URLs are tested for each role:

```json
{
  "admin": ["/, "/dashboard", "/admin", "/reports"],
  "manager": ["/", "/dashboard", "/teams"],
  ...
}
```

### Keycloak Selectors

If you have a custom Keycloak theme, update the selectors in `unlighthouse.config.ts`:

- Username input selector
- Password input selector
- Submit button selector

## Troubleshooting

### JWT Session Errors During Tests

You may see JWT errors in your Next.js server logs during testing:

```
[auth][error] JWTSessionError: Read more at https://errors.authjs.dev#jwtsessionerror
[auth][cause]: co: Invalid Compact JWE
```

**This is expected behavior** during Unlighthouse audits because:

- The crawler uses Puppeteer which creates isolated browser contexts
- Session tokens are established during authentication but may not persist perfectly across all Lighthouse workers
- The app is still functionally authenticated (dashboard loads, protected routes work)
- These errors don't affect the quality of the Lighthouse audit results

**Why this happens:**

- Unlighthouse spawns multiple worker processes to audit pages in parallel
- Each worker may create a new browser context
- The session storage/cookies from authentication may not be perfectly shared
- NextAuth tries to decode the session and fails for some requests

**This is safe because:**

- The actual user authentication flow works (verified during initial login)
- Protected routes are accessible (the crawler successfully navigates them)
- The Lighthouse audits measure page performance, not authentication correctness
- No actual user data or security is compromised (it's a local test environment)

If you want to reduce these errors, you can:

1. Run tests with `samples: 1` in the scanner config (already configured)
2. Test one role at a time instead of all roles sequentially
3. Clear browser data between runs: `rm -rf .puppeteer_data`

### Discovery of Nested/Dynamic Routes

Unlighthouse automatically discovers routes by:

1. Starting from the URLs in `role-routes.json`
2. Crawling all `<a>` tags and navigation links
3. Following discovered routes up to `maxRoutes: 500`

**Dynamic routes (e.g., `/projects/[id]`)** will be discovered if:

- They're linked from a page the crawler visits
- You add specific examples to `role-routes.json`

To ensure dynamic routes are tested:

1. Add example URLs to `role-routes.json`: `"/projects/123"`, `"/teams/456"`
2. Or ensure your navigation menus/lists link to real IDs
3. Check the generated report to see all discovered URLs

The crawler configuration includes:

- `maxRoutes: 500` - Will crawl up to 500 different pages
- Follows all internal links automatically
- Excludes API routes and static files
- Preserves authentication across page navigations

### Login Issues

- Open DevTools on the Keycloak login page and verify the CSS selectors
- Ensure credentials are correct
- Check that the `/login` route properly redirects to Keycloak

### Missing Pages

- Add routes to `role-routes.json`
- Ensure pages are linked in your navigation
- Check for 401/403 errors in the Next.js server logs

### Performance

- Always test in production mode (`npm run build` + `npx next start`)
- Use `--desktop` flag for desktop audits
- Increase `samples` in config for more stable results

## Reports

Reports are saved in `reports/` directory:

- `reports/admin/` - Admin role audit
- `reports/manager/` - Manager role audit
- `reports/staff/` - Staff role audit
- `reports/student/` - Student role audit

Each report includes:

- Performance scores
- Accessibility issues
- SEO recommendations
- Best practices violations
- Detailed per-page metrics

## Additional Resources

- [Unlighthouse Documentation](https://unlighthouse.dev/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
