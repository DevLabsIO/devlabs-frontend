// unlighthouse.config.mjs
import { defineUnlighthouseConfig } from "unlighthouse/config";
import roleUrls from "./role-routes.json" with { type: "json" };

const ROLE = process.env.ROLE ?? "user";

export default defineUnlighthouseConfig({
    site: "http://localhost:3000",

    // Good defaults for app audits
    scanner: {
        device: "mobile", // use --desktop if you prefer
        samples: 1,
        throttle: true,
        skipJavascript: false,
        maxRoutes: 500, // Increase to discover more pages
    },

    // Make role-only areas discoverable
    urls: roleUrls?.[ROLE] ?? ["/"],

    // Avoid logging out mid-crawl
    routeRules: [
        { pattern: "/logout", exclude: true },
        { pattern: "/api/auth/signout", exclude: true },
        { pattern: "/api/auth/*", exclude: true }, // Exclude all auth API routes
    ],

    // Fine for local/dev - enable better discovery
    discovery: {
        sitemap: false,
        robotsTxt: false,
        // Allow crawler to follow more links
        skipJavascript: false,
    },

    // Improve crawler behavior
    crawler: {
        maxRoutes: 500, // Crawl up to 500 routes
        include: ["/.*"], // Include all routes
        exclude: [
            "/api/.*", // Exclude API routes
            "/.*\\.(jpg|jpeg|png|gif|svg|pdf|zip)$", // Exclude static files
        ],
    },

    // Keep session across navigations (handy if KC bounces)
    puppeteerOptions: {
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    },
    lighthouseOptions: {
        disableStorageReset: true,
        skipAboutBlank: true,
    },

    hooks: {
        async authenticate(page) {
            const APP = "http://localhost:3000";
            const LOGIN = `${APP}/login`;
            const USER = process.env.KC_USERNAME || "user";
            const PASS = process.env.KC_PASSWORD || "password";

            // Be generous with timeouts for Windows/local runs
            page.setDefaultNavigationTimeout(120000);
            page.setDefaultTimeout(60000);

            // Helpful debug
            page.on("requestfailed", (r) =>
                console.log("[net-fail]", r.failure()?.errorText, r.url())
            );
            page.on(
                "console",
                (m) => m.type() !== "log" && console.log("[page]", m.type().toUpperCase(), m.text())
            );

            // 1) Hit your app's login
            await page.goto(LOGIN, { waitUntil: "domcontentloaded" });
            await page.waitForNetworkIdle({ idleTime: 500, timeout: 60000 });
            console.log("[Auth] On login page");

            // 2) Click the app's "Login/Continue with Keycloak" trigger if present
            // (Puppeteer has no :has-text; find a button containing "Keycloak" or "Login")
            try {
                const buttons = await page.$$("button, a");
                let clicked = false;
                for (const el of buttons) {
                    const text = (await el.evaluate((n) => n.textContent || ""))
                        .trim()
                        .toLowerCase();
                    if (
                        text.includes("keycloak") ||
                        text === "login" ||
                        text.includes("continue")
                    ) {
                        console.log("[Auth] Clicking app login button:", text);
                        await Promise.all([
                            page
                                .waitForNavigation({ waitUntil: "domcontentloaded" })
                                .catch(() => null),
                            el.click(),
                        ]);
                        clicked = true;
                        break;
                    }
                }
                if (!clicked)
                    console.log("[Auth] No explicit login button; assuming auto-redirect.");
            } catch (e) {
                console.log("[Auth] Could not click login trigger:", e.message);
            }

            // Helper: find a frame that looks like Keycloak (or just use main frame)
            const findKCFrame = () => {
                const frames = page.frames();
                const hint = /keycloak|\/realms\/|openid-connect/i;
                return frames.find((f) => hint.test(f.url())) || page.mainFrame();
            };

            // 3) Wait until we see any KC-related element or a realm URL
            for (let i = 0; i < 3; i++) {
                const f = findKCFrame();
                const seen = await Promise.race([
                    f
                        .waitForSelector(
                            '#username, input[name="username"], input#email, input[name="email"]',
                            { timeout: 5000 }
                        )
                        .then(() => true)
                        .catch(() => false),
                    f
                        .waitForSelector(
                            '#kc-login, button[name="login"], input[name="login"], button[type="submit"]',
                            { timeout: 5000 }
                        )
                        .then(() => true)
                        .catch(() => false),
                    page
                        .waitForNavigation({ waitUntil: "domcontentloaded", timeout: 5000 })
                        .then(() => true)
                        .catch(() => false),
                ]);
                if (seen) break;
            }

            const f = findKCFrame();

            // 4) Some realms show an IdP/Continue page—click if present
            try {
                const idpButtons = await f.$$("button, a");
                for (const el of idpButtons) {
                    const t = (await el.evaluate((n) => n.textContent || "")).trim().toLowerCase();
                    if (t.includes("continue") || t.includes("proceed") || t.includes("keycloak")) {
                        console.log("[Auth] Clicking IdP/Continue:", t);
                        await Promise.all([
                            page
                                .waitForNavigation({ waitUntil: "domcontentloaded" })
                                .catch(() => null),
                            el.click(),
                        ]);
                        break;
                    }
                }
            } catch {}

            // 5) Type username/password (with multiple selector fallbacks)
            try {
                await f.waitForSelector(
                    '#username, input[name="username"], input#email, input[name="email"]',
                    { timeout: 20000 }
                );
                await f.type(
                    '#username, input[name="username"], input#email, input[name="email"]',
                    USER,
                    { delay: 10 }
                );
                await f.type('#password, input[name="password"]', PASS, { delay: 10 });
            } catch {
                await page.screenshot({
                    path: "auth-failed-before-submit.png",
                    fullPage: true,
                });
                throw new Error(
                    "Could not find username/password inputs. See auth-failed-before-submit.png"
                );
            }

            // 6) Submit and wait for ANY of these to happen:
            // - navigation
            // - URL becomes our app (and not /login)
            // - a redirect/callback response fires (code/session_state)
            const submitSel =
                '#kc-login, button[name="login"], input[name="login"], button[type="submit"]';
            const appUrlReached = () => page.url().startsWith(APP) && !/\/login\b/.test(page.url());

            const waitForFinished = Promise.race([
                page
                    .waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 })
                    .catch(() => null),
                page.waitForFunction(appUrlReached, { timeout: 60000 }).catch(() => null),
                page
                    .waitForResponse(
                        (res) => {
                            const u = res.url();
                            return /openid-connect\/token|redirect_uri|session_state|code=/.test(u);
                        },
                        { timeout: 60000 }
                    )
                    .catch(() => null),
            ]);

            await Promise.all([
                waitForFinished,
                f.click(submitSel).catch(async () => {
                    // some themes have <input type=submit> inside a form; try form submit
                    const ok = await f.evaluate(() => {
                        const btn = document.querySelector(
                            '#kc-login, button[name="login"], input[name="login"], button[type="submit"]'
                        );
                        if (btn) {
                            btn.click();
                            return true;
                        }
                        const form = document.querySelector("form");
                        if (form) {
                            form.submit();
                            return true;
                        }
                        return false;
                    });
                    if (!ok) throw new Error("No submit control found to click/submit");
                }),
            ]);

            // 7) Final sanity check
            if (!appUrlReached()) {
                await page.waitForNetworkIdle({ idleTime: 800, timeout: 20000 }).catch(() => null);
            }
            if (!appUrlReached()) {
                await page.screenshot({
                    path: "auth-stuck-after-submit.png",
                    fullPage: true,
                });
                throw new Error("Login didn't reach app. See auth-stuck-after-submit.png");
            }

            console.log("[Auth] Logged in and back on app:", page.url());
        },
    },
});
