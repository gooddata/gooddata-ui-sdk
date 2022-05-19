// (C) 2021-2022 GoodData Corporation

import * as path from "path";

import { DefaultLocale } from "../data";
import * as utils from "../utils";
import { error, done, skipped, message } from "../utils/console";
import { LocalesItem } from "../schema/localization";

const CheckInsightPipe = "|insight";
const CheckReportPipe = "|report";

/**
 * This validation is for epic TNT-160.
 *
 * This function check that every value in en-US.json that contains the string with the word "Insight"
 * should have special key - "<something>|insight": "Text about insight".
 *
 * Also if there are keys with suffix |insight, there should be the same amount of keys with suffix |report.
 */
export async function getInsightToReportCheck(
    localizationPath: string,
    run: boolean = true,
    debug: boolean = false,
) {
    if (!run) {
        skipped("Insight to report check is skipped", true);
        return;
    }

    message("Insight to report check is starting ...", debug);

    const { values, keys } = await loadDefaultLocale(localizationPath, debug);

    const insightIndexes = values
        .map((value, index) => (value.value.toLowerCase().includes("insight") ? index : null))
        .filter((item) => item !== null);

    insightIndexes.forEach((index) => {
        const key = keys[index];
        if (!key.includes(CheckInsightPipe)) {
            error(`⨯ Insight to report check ends with error.`, true);
            throw new Error(`Localization key "${key}" does not contain "${CheckInsightPipe}" suffix`);
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

    if (missingReportKeys.length > 0 || missingInsightKeys.length > 0) {
        error(`Insight to report check ends with error.`, true);
        throw new Error(
            `Some keys missing in localisation file, missing keys: ${JSON.stringify([
                ...missingInsightKeys,
                ...missingReportKeys,
            ])}`,
        );
    }

    const reportsKeyWithTranslate = allReportsKeys
        .map((key) => {
            const item = values[keys.indexOf(key)];
            const translate = item.translate;
            return translate !== false ? key : null;
        })
        .filter((item) => item !== null);

    if (reportsKeyWithTranslate.length > 0) {
        error(`Insight to report check ends with error.`, true);
        throw new Error(
            `Translation is enable for report keys, use translate=false, invalid keys: ${JSON.stringify(
                reportsKeyWithTranslate,
            )}`,
        );
    }

    done("Done", debug);
}

async function loadDefaultLocale(
    localizationPath: string,
    debug = false,
): Promise<{ values: Array<LocalesItem>; keys: Array<string> }> {
    let enUS;

    try {
        enUS = await utils.readFile(path.join(localizationPath, DefaultLocale));
    } catch (err) {
        error(err, debug);
        throw err;
    }

    const parsed = JSON.parse(enUS.toString());
    const keys = Object.keys(parsed);

    const allValues = Object.values(parsed) as Array<LocalesItem | string>;
    const values = allValues.filter((value) => typeof value === "object") as Array<LocalesItem>;

    if (allValues.length !== values.length) {
        const invalidKeys = keys.filter((key) => typeof parsed[key] === "string") as Array<string>;
        throw new Error(
            `File ${DefaultLocale} is not valid because contains string messages instead of objects, see: ${JSON.stringify(
                invalidKeys,
            )}`,
        );
    }

    return { values, keys };
}
