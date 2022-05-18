// (C) 2021-2022 GoodData Corporation

import * as path from "path";

import { readDir, readFile, flatten } from "./utils";
import { LocalesItem, LocalesStructure } from "./schema/localization";

export async function getLocalizationFiles(localizationPath: string): Promise<Buffer[]> {
    const localizationFileNames = await readDir(localizationPath);
    const localizations = localizationFileNames.map((localizationFileName) =>
        readFile(path.join(localizationPath, localizationFileName)),
    );

    return Promise.all(localizations);
}

export function getParsedLocalizations(localizations: Array<Buffer>): Array<LocalesStructure> {
    return localizations.map((localization) => JSON.parse(localization.toString()));
}

export function getLocalizationValues(localizations: Array<LocalesStructure>): Array<string> {
    const mergedLocalizationValues: Array<LocalesItem | string> = flatten(
        localizations.map((localization) => Object.values(localization)),
    );

    return mergedLocalizationValues.reduce((prev, current) => {
        if (typeof current === "object") {
            prev.push(current.value);
        } else if (typeof current === "string") {
            prev.push(current);
        }
        return prev;
    }, [] as Array<string>);
}
