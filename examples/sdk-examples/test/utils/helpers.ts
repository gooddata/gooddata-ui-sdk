// (C) 2006-2019 GoodData Corporation
import { t as testController, Selector, Role } from "testcafe";
import { config } from "./config";

// retries async check() until it resolves or time runs out
const retry = async (check = async () => true, timeout = 1000, interval = 100, started = Date.now()) => {
    const startTime = Date.now();
    return check().catch((error) => {
        return new Promise((resolve, reject) => {
            const resolveTime = Date.now();
            if (Date.now() + interval > started + timeout) {
                reject(error);
            }
            setTimeout(
                () => retry(check, timeout, interval, started).then(resolve, reject),
                Math.max(startTime - resolveTime + interval, 0),
            );
        });
    });
};

// returns a promise that is resolved with true when selector exists and rejected when it does not
// or the other way around if expectExist is false
export const selectorExists = async (query, expectExist = true): Promise<boolean> => {
    const exists = await Selector(query).exists;
    if (exists === expectExist) {
        return true;
    } else {
        throw new Error("Element does not exist");
    }
};

export const loginUsingLoginForm =
    (redirectUri = "/", retryCount = 2) =>
    async (tc = testController) => {
        const isLoggedInQuery = ".s-isLoggedIn";

        // wait till s-isWaitingForLoggedInStatus disappears
        // allow long timeout because of page load
        await retry(() => selectorExists(".s-isWaitingForLoggedInStatus", false), 15000).catch((error) => {
            // eslint-disable-next-line no-console
            console.error("ERROR: s-isWaitingForLoggedInStatus forever. Probably a JS issue", error);
            // no reason to retry, something is most likely broken
        });

        // if already logged in, redirect immediately
        if (await Selector(isLoggedInQuery).exists) {
            // eslint-disable-next-line no-console
            console.warn("already logged in");
            return tc.navigateTo(redirectUri);
        }

        // fill in the login form
        await tc
            .typeText(".s-login-input-email", config.username, { paste: true, replace: true })
            .typeText(".s-login-input-password", config.password, { paste: true, replace: true })
            .click(".s-login-submit");

        // wait for isLoggedIn to appear
        return retry(() => selectorExists(isLoggedInQuery, true), 3000).then(
            () => {
                // success: redirect
                return tc.navigateTo(redirectUri);
            },
            (error) => {
                // eslint-disable-next-line no-console
                console.warn("failed to log in", error);
                if (retryCount > 0) {
                    // eslint-disable-next-line no-console
                    console.warn("retrying", retryCount, "times");
                    return loginUsingLoginForm(redirectUri, retryCount - 1)(tc);
                }
                // eslint-disable-next-line no-console
                console.warn("no more retries, sorry");
                return error;
            },
        );
    };

export const checkRenderChart = async (selector, t) => {
    const loading = Selector(".s-loading");
    const chart = Selector(selector);

    await t.expect(loading.exists).ok();

    await t.expect(chart.exists).ok().expect(chart.textContent).ok();
};

export const regularUser = Role(`${config.url}`, async (tc = testController) => {
    // wait till s-isWaitingForLoggedInStatus disappears
    // allow long timeout because of page load
    await retry(() => selectorExists(".s-isWaitingForLoggedInStatus", false), 15000).catch((error) => {
        // eslint-disable-next-line no-console
        console.error("ERROR: s-isWaitingForLoggedInStatus forever. Probably a JS issue", error);
        // no reason to retry, something is most likely broken
    });

    await tc
        .typeText(".s-login-input-email", config.username, { paste: true, replace: true })
        .typeText(".s-login-input-password", config.password, { paste: true, replace: true })
        .click(".s-login-submit");
});

export const loginUserAndNavigate =
    (redirectUri = "/") =>
    async (tc = testController) => {
        if (config.username === undefined) {
            await tc.navigateTo(redirectUri);
        } else {
            await tc.useRole(regularUser).navigateTo(redirectUri);
        }
    };
