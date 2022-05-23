// (C) 2021-2022 GoodData Corporation

import * as path from "path";

import { LocalesStructure } from "../schema/localization";
import { DefaultLocale } from "../data";
import { message, done, fail } from "../utils/console";

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
