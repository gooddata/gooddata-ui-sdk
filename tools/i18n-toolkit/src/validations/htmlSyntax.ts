// (C) 2021-2022 GoodData Corporation

import { HtmlValidate } from "html-validate";
import flatten from "lodash/flatten";

import { done, message, skipped, fail } from "../utils/console";

export async function getHtmlSyntaxCheck(
    localizations: Array<string>,
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

    localizations
        .filter((localization) => localization.match(htmlRegex))
        .forEach((localization) => {
            const validation = htmlValidate.validateString(localization);

            if (!validation.valid) {
                const validationResults = validation.results.map((validationResult) =>
                    validationResult.messages.filter((message) => message.ruleId === "parser-error"),
                );

                const count = flatten(validationResults).length;
                if (count) {
                    fail(`Html message check ends with ${count} errors.`, true);
                    throw new Error(
                        `Html format of localization is not correct, see: ${JSON.stringify(localization)}`,
                    );
                }
            }
        });

    done("Done", debug);
}
