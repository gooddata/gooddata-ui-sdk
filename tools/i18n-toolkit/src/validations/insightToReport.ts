// (C) 2021-2022 GoodData Corporation

import { DefaultLocale, CheckInsightPipe, CheckReportPipe } from "../data.js";
import { done, skipped, message, fail } from "../utils/console.js";
import { LocalesItem, LocalesStructure } from "../schema/localization.js";

/**
 * This validation is for epic TNT-160.
 *
 * This function check that every value in en-US.json that contains the string with the word "Insight"
 * should have special key - "<something>|insight": "Text about insight".
 *
 * Also if there are keys with suffix |insight, there should be the same amount of keys with suffix |report.
 */
export async function getInsightToReportCheck(
    localizations: Array<[string, LocalesStructure]>,
    run: boolean = true,
    debug: boolean = false,
) {
    if (!run) {
        skipped("Insight to report check is skipped", true);
        return;
    }

    message("Insight to report check is starting ...", debug);

    const localizationsDefaults = localizations.filter(([pth]) => pth.includes(DefaultLocale));
    await Promise.all(
        localizationsDefaults.map(async ([path, content]) => {
            message(` ┗ Processing locales directory "${path}"`, debug);

            const {
                missingInsightReportSwitch,
                missingInsightKeys,
                missingReportKeys,
                reportsKeyWithTranslate,
            } = await getValidationData(path, content);

            if (missingInsightReportSwitch.length > 0) {
                fail(`Insight to report check ends with error.`, true);
                throw new Error(
                    `Localization keys does not contain "${CheckInsightPipe}" suffix, see: ${JSON.stringify(
                        missingInsightReportSwitch,
                    )}`,
                );
            }

            if (missingReportKeys.length > 0 || missingInsightKeys.length > 0) {
                fail(`Insight to report check ends with error.`, true);
                throw new Error(
                    `Some keys missing in localisation file, missing keys: ${JSON.stringify([
                        ...missingInsightKeys,
                        ...missingReportKeys,
                    ])}`,
                );
            }

            if (reportsKeyWithTranslate.length > 0) {
                fail(`Insight to report check ends with error.`, true);
                throw new Error(
                    `Translation is enable for report keys, use translate=false, invalid keys: ${JSON.stringify(
                        reportsKeyWithTranslate,
                    )}`,
                );
            }
        }),
    );

    done("Done", debug);
}

async function loadDefaultLocale(
    path: string,
    localesStructure: LocalesStructure,
): Promise<{ values: Array<LocalesItem>; keys: Array<string> }> {
    const keys = Object.keys(localesStructure);

    const allValues = Object.values(localesStructure) as Array<LocalesItem | string>;
    const values = allValues.filter((value) => typeof value === "object") as Array<LocalesItem>;

    if (allValues.length !== values.length) {
        const invalidKeys = keys.filter((key) => typeof localesStructure[key] === "string") as Array<string>;
        throw new Error(
            `File "${path}" is not valid because contains string messages instead of objects, see: ${JSON.stringify(
                invalidKeys,
            )}`,
        );
    }

    return { values, keys };
}

async function getValidationData(path: string, localesStructure: LocalesStructure) {
    const { values, keys } = await loadDefaultLocale(path, localesStructure);

    const insightIndexes = values
        .map((value, index) => (value.value.toLowerCase().includes("insight") ? index : null))
        .filter((item) => item !== null);

    const missingInsightReportSwitch: string[] = [];
    insightIndexes.forEach((index) => {
        const key = keys[index];
        if (!key.includes(CheckInsightPipe)) {
            missingInsightReportSwitch.push(key);
        }
    });

    const allInsightKeys = keys.filter((key) => key.includes(CheckInsightPipe));
    const allReportsKeys = keys.filter((key) => key.includes(CheckReportPipe));

    const missingReportKeys = allInsightKeys
        .map((insightKey) => {
            const reportKey = insightKey.replace(CheckInsightPipe, CheckReportPipe);
            return allReportsKeys.includes(reportKey) ? null : reportKey;
        })
        .filter((item) => item !== null);

    const missingInsightKeys = allReportsKeys
        .map((reportKey) => {
            const insightKey = reportKey.replace(CheckReportPipe, CheckInsightPipe);
            return allInsightKeys.includes(insightKey) ? null : insightKey;
        })
        .filter((item) => item !== null);

    const reportsKeyWithTranslate = allReportsKeys
        .map((key) => {
            const item = values[keys.indexOf(key)];
            const translate = item.translate;
            return translate !== false ? key : null;
        })
        .filter((item) => item !== null);

    return {
        missingInsightReportSwitch,
        missingReportKeys,
        missingInsightKeys,
        reportsKeyWithTranslate,
    };
}
