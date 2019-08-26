// (C) 2007-2019 GoodData Corporation
import { t as testController, Selector } from "testcafe";
import { config } from "./config";

async function getCell(t, selector, cellSelector) {
    const chart = Selector(selector);
    await t.expect(chart.exists).eql(true, `${selector} not found`);
    if (!cellSelector) {
        return null;
    }
    const cell = await chart.find(`.ag-body-viewport ${cellSelector}`);
    await t.expect(cell.exists).eql(true, `${cellSelector} not found in ${selector}`);
    return cell;
}

export async function checkCellValue(t, selector, cellValue, cellSelector = ".ag-cell") {
    const cell = await getCell(t, selector, cellSelector);
    if (cellValue) {
        await t
            .expect(cell.textContent)
            .eql(cellValue, `expected ${cellSelector} to contain text ${cellValue}`);
    }
}

export async function checkCellHasClassName(t, selector, expectedClassName, cellSelector) {
    const cell = await getCell(t, selector, cellSelector);
    await t
        .expect(cell.hasClass(expectedClassName))
        .ok(`expected ${cellSelector} to has class ${expectedClassName}`);
}

export async function checkCellHasNotClassName(t, selector, expectedClassName, cellSelector) {
    const cell = await getCell(t, selector, cellSelector);
    await t
        .expect(cell.hasClass(expectedClassName))
        .notOk(`expected ${cellSelector} to has not class ${expectedClassName}`);
}

export const loginUsingGreyPages = (redirectUri = "/") => {
    return (tc = testController) =>
        tc
            .navigateTo("/gdc/account/login")
            .typeText("input[name=USER]", config.username, { paste: true, replace: true })
            .typeText("input[name=PASSWORD]", config.password, { paste: true, replace: true })
            .click("input[name=submit]")
            .navigateTo(redirectUri);
};

// retries async check() untill it resolves or time runs out
const retry = async (check = async () => true, timeout = 1000, interval = 100, started = Date.now()) => {
    const startTime = Date.now();
    return check().catch(error => {
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
export const selectorExists = (query, expectExist = true) =>
    new Promise(async (resolve, reject) => {
        const exists = await Selector(query).exists;
        if (exists === expectExist) {
            resolve(true);
        } else {
            reject();
        }
    });

export const loginUsingLoginForm = (redirectUri = "/", retryCount = 2) => async (tc = testController) => {
    const isLoggedInQuery = ".s-isLoggedIn";

    // wait till s-isWaitingForLoggedInStatus disappears
    // allow long timeout because of page load
    await retry(() => selectorExists(".s-isWaitingForLoggedInStatus", false), 15000).catch(error => {
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
        error => {
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

export const waitForPivotTableStopLoading = async t => {
    await t.expect(Selector(".s-pivot-table .s-loading").exists).notOk();
};
