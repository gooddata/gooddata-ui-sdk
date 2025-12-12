// (C) 2021-2025 GoodData Corporation

import * as path from "path";

import { DefaultLocale } from "../data.js";
import { type LocalesStructure } from "../schema/localization.js";
import { done, fail, message } from "../utils/console.js";

export async function getDefaultLocalesCheck(
    localizationPaths: string[],
    localizations: Array<[string, LocalesStructure]>,
    debug = false,
) {
    message("Default locale files check is starting ...", debug);

    const paths = localizations.map(([pth]) => pth);

    localizationPaths.forEach((pth) => {
        const defaultPath = path.join(pth, DefaultLocale);
        if (!paths.includes(defaultPath)) {
            fail(`Can not found default locales file "${DefaultLocale}" in "${pth}"`, true);
            throw new Error(`Can not found default locales file "${DefaultLocale}" in "${pth}"`);
        }
    });

    done("Done", debug);
}
