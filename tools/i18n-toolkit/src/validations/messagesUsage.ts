// (C) 2021-2022 GoodData Corporation
import { extract } from "@formatjs/cli-lib";
import fastGlob from "fast-glob";
import * as path from "path";

import { skipped, done, message, resultsInfo, fail } from "../utils/console.js";
import { ToolkitConfigFile, DefaultLocale, UsageResult } from "../data.js";
import { checkTranslations } from "./usage/checkTranslations.js";
import { LocalesStructure } from "../schema/localization.js";

const { sync } = fastGlob;

export async function getUsageMessagesCheck(
    cwd: string,
    localizations: Array<[string, LocalesStructure]>,
    run: boolean = true,
    {
        source = "src/**/*.{ts,js,tsx,jsx}",
        rules = [],
        insightToReport,
    }: {
        source: string;
        rules: ToolkitConfigFile["rules"];
        insightToReport: boolean;
    },
    debug: boolean = false,
) {
    if (!run) {
        skipped("Usage of messages id check is skipped", true);
        return;
    }

    message("Usage of messages id check is starting ...", debug);

    if (rules.length === 0) {
        fail("There are no localisations check rules defined, see README.md to configure some rules.", true);
        throw new Error(
            `There are no localisations check rules defined, see README.md to configure some rules.`,
        );
    }

    const defaultLocalizations = localizations.filter(([pth]) => pth.includes(DefaultLocale));
    const extracted = await extractMessages(cwd, source, debug);

    const { results, uncontrolled } = checkTranslations(defaultLocalizations, rules, extracted, {
        insightToReport,
    });
    resultsInfo(cwd, results, uncontrolled, debug);

    const determinedError = errorBasedOnResults(results, uncontrolled);

    if (determinedError) {
        fail(determinedError.message, true);
        throw determinedError;
    }

    done("Done", debug);
}

async function extractMessages(cwd: string, source: string, debug = false): Promise<Record<string, any>> {
    message(` ┣ Extracting messages in "${source}".`, debug);

    try {
        const files = sync(path.join(cwd, source), { dot: true });
        //NOTE: Filter out .d.ts files, because formatjs con not load it or ignore it
        const filtered = files.filter((file) => !file.match(/\.d\.ts$/));
        const results = await extract(filtered, {
            extractSourceLocation: true,
        });
        return JSON.parse(results);
    } catch (e: any) {
        fail(`Can not extract messages from "${source}".`, true);
        throw new Error(`Can not extract messages from "${source}".`);
    }
}

function errorBasedOnResults(results: UsageResult[], uncontrolled: Array<string>): Error | null {
    if (uncontrolled.length > 0) {
        return new Error(`There are some uncontrolled and not ignored keys in localisation files.`);
    }

    return results.reduce((error, { ignore, stats }) => {
        if (ignore) {
            return error;
        }

        if (stats.missing > 0 || stats.unused > 0) {
            return new Error(`There are some missing and unused keys in localisation files.`);
        }

        return error;
    }, null as Error | null);
}
