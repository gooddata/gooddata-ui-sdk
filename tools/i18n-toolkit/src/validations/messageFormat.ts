// (C) 2021-2022 GoodData Corporation
import { parse } from "@formatjs/icu-messageformat-parser";
import { skipped, done, message, fail } from "../utils/console.js";

export async function getIntlMessageFormatCheck(
    localizations: Array<string>,
    run: boolean = true,
    debug: boolean = false,
) {
    if (!run) {
        skipped("Intl message check is skipped", true);
        return;
    }

    message("Intl message check is starting ...", debug);

    localizations.forEach((localization) => {
        try {
            parse(localization);
        } catch (err) {
            fail(`Intl message check ends with error.`, true);
            throw new Error(
                `Intl format of localization is not correct, see: ${JSON.stringify(localization)}, cause ${
                    err.message ?? "unknown"
                }`,
            );
        }
    });

    done("Done", debug);
}
