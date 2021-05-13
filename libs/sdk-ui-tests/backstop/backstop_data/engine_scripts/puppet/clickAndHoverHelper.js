/* eslint-disable no-console,header/header */

const debug = process.env.BACKSTOP_DEBUG;

async function withVisibleSelector(page, scenario, selector, fun) {
    if (debug) {
        console.log("DEBUG >", scenario.label, "| Waiting for selector to be visible", selector);
    }

    await page.waitForSelector(selector, { visible: true });

    try {
        await fun();
    } catch (e) {
        if (e.message.indexOf("not visible") === -1) {
            throw e;
        }

        console.warn(
            "FLAKYNESS >",
            scenario.label,
            "| seems to use some fishy React components. Elements may be momentarily flashing in and out of visibility.",
        );

        await page.waitForSelector(selector, { visible: true, timeout: 50 });
        await fun();
    }
}

module.exports = async (page, scenario) => {
    const hoverSelectors = scenario.hoverSelectors || scenario.hoverSelector;
    const clickSelectors = scenario.clickSelectors || scenario.clickSelector;
    const keyPressSelectors = scenario.keyPressSelectors || scenario.keyPressSelector;
    const scrollToSelector = scenario.scrollToSelector;
    const postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

    if (keyPressSelectors) {
        for (const keyPressSelector of [].concat(keyPressSelectors)) {
            await page.waitForTimeout(keyPressSelector.selector);
            await page.type(keyPressSelector.selector, keyPressSelector.keyPress);
        }
    }

    if (hoverSelectors) {
        for (const hoverSelector of [].concat(hoverSelectors)) {
            if (typeof hoverSelector === "string") {
                await withVisibleSelector(page, scenario, hoverSelector, () => {
                    return page.hover(hoverSelector);
                });
            } else {
                if (debug) {
                    console.log("DEBUG >", scenario.label, "| Waiting for ", hoverSelector, "millis");
                }

                await page.waitForTimeout(hoverSelector);
            }
        }
    }

    if (clickSelectors) {
        for (const clickSelector of [].concat(clickSelectors)) {
            if (typeof clickSelector === "string") {
                await withVisibleSelector(page, scenario, clickSelector, () => {
                    return page.click(clickSelector);
                });
            } else {
                if (debug) {
                    console.log("DEBUG >", scenario.label, "| Waiting for ", clickSelector, "millis");
                }

                await page.waitForTimeout(clickSelector);
            }
        }
    }

    if (postInteractionWait) {
        if (typeof postInteractionWait === "string") {
            if (debug) {
                console.log(
                    "DEBUG >",
                    scenario.label,
                    "| Waiting for selector to be visible ",
                    postInteractionWait,
                );
            }

            await page.waitForSelector(postInteractionWait, { visible: true });
        } else {
            if (debug) {
                console.log("DEBUG >", scenario.label, "| Waiting for ", postInteractionWait, "millis");
            }

            await page.waitForTimeout(postInteractionWait);
        }
    }

    if (scrollToSelector) {
        await page.waitForSelector(scrollToSelector);

        await page.evaluate((scrollToSelector) => {
            document.querySelector(scrollToSelector).scrollIntoView();
        }, scrollToSelector);
    }
};
