// (C) 2021-2025 GoodData Corporation
import { extract } from "@formatjs/cli-lib";
import fastGlob from "fast-glob";
import * as path from "path";

import { DefaultLocale, ToolkitConfigFile, UsageResult } from "../data.js";
import { LocalesStructure } from "../schema/localization.js";
import { done, fail, message, resultsInfo, skipped } from "../utils/console.js";
import { checkTranslations } from "./usage/checkTranslations.js";

const { sync } = fastGlob;

export async function getUsageMessagesCheck(
    cwd: string,
    localizations: Array<[string, LocalesStructure]>,
    run: boolean = true,
    {
        source = "src/**/*.{ts,js,tsx,jsx}",
        rules = [],
    }: {
        source: string;
        rules: ToolkitConfigFile["rules"];
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

    const { results, uncontrolled } = checkTranslations(defaultLocalizations, rules, extracted);
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

    return results.reduce(
        (error, { ignore, stats, data }) => {
            const unusedMessages = data.unusedMessages;
            const missingMessages = data.missingMessages;

            if (ignore) {
                return error;
            }

            if (stats.missing > 0 || stats.unused > 0) {
                const details = [];
                if (unusedMessages.length > 0) {
                    details.push(`Unused messages: ${unusedMessages.join(", ")}`);
                }
                if (missingMessages.length > 0) {
                    details.push(`Missing messages: ${missingMessages.join(", ")}`);
                }

                return new Error(
                    `There are some missing and unused keys in localisation files. Found ${
                        stats.missing
                    } missing and ${stats.unused} unused keys.\n${details.join("\n")}`,
                );
            }

            return error;
        },
        null as Error | null,
    );
}
