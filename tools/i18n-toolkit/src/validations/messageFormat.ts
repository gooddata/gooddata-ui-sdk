// (C) 2021-2025 GoodData Corporation

import { parse } from "@formatjs/icu-messageformat-parser";

import { type LocalesStructure } from "../schema/localization.js";
import { done, fail, message, skipped } from "../utils/console.js";

interface IIntlError {
    key: string;
    file: string;
    value: string;
    cause: string;
}

export async function getIntlMessageFormatCheck(
    localizations: Array<[string, LocalesStructure]>,
    run: boolean = true,
    debug: boolean = false,
) {
    if (!run) {
        skipped("Intl message check is skipped", true);
        return;
    }

    message("Intl message check is starting ...", debug);

    const errors: IIntlError[] = [];

    localizations.forEach(([file, content]) => {
        Object.entries(content).forEach(([key, item]) => {
            const value = typeof item === "object" ? item.value : item;
            try {
                parse(value);
            } catch (err) {
                errors.push({
                    key,
                    file,
                    value,
                    cause: err.message ?? "unknown",
                });
            }
        });
    });

    if (errors.length > 0) {
        fail(`Intl message check ends with ${errors.length} error(s).`, true);

        const errorDetails = errors
            .map(
                (err) =>
                    `  Key: "${err.key}"\n` +
                    `  File: ${err.file}\n` +
                    `  Value: ${JSON.stringify(err.value)}\n` +
                    `  Cause: ${err.cause}`,
            )
            .join("\n\n");

        throw new Error(`Intl format of localizations is not correct.\n\n${errorDetails}`);
    }

    done("Done", debug);
}
