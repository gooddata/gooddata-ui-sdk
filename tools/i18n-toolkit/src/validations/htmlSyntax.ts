// (C) 2021-2025 GoodData Corporation

import { HtmlValidate } from "html-validate";

import { type LocalesStructure } from "../schema/localization.js";
import { done, fail, message, skipped } from "../utils/console.js";

interface IHtmlError {
    key: string;
    file: string;
    value: string;
}

export async function getHtmlSyntaxCheck(
    localizations: Array<[string, LocalesStructure]>,
    run: boolean = true,
    debug: boolean = false,
) {
    if (!run) {
        skipped("Html message check is skipped", true);
        return;
    }

    message("Html message check is starting ...", debug);

    const htmlValidate = new HtmlValidate();
    const htmlRegex = new RegExp(/<[^>]*>/);
    const errors: IHtmlError[] = [];

    localizations.forEach(([file, content]) => {
        Object.entries(content).forEach(([key, item]) => {
            const value = typeof item === "object" ? item.value : item;

            if (!value.match(htmlRegex)) {
                return;
            }

            const validation = htmlValidate.validateStringSync(value);

            if (!validation.valid) {
                const validationResults = validation.results.map((validationResult) =>
                    validationResult.messages.filter((message) => message.ruleId === "parser-error"),
                );

                const count = validationResults.flat().length;
                if (count) {
                    errors.push({ key, file, value });
                }
            }
        });
    });

    if (errors.length > 0) {
        fail(`Html message check ends with ${errors.length} error(s).`, true);

        const errorDetails = errors
            .map(
                (err) =>
                    `  Key: "${err.key}"\n` +
                    `  File: ${err.file}\n` +
                    `  Value: ${JSON.stringify(err.value)}`,
            )
            .join("\n\n");

        throw new Error(`Html format of localizations is not correct.\n\n${errorDetails}`);
    }

    done("Done", debug);
}
