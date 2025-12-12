// (C) 2021-2025 GoodData Corporation

import * as path from "path";

import glob from "fast-glob";

import { type LocalesItem, type LocalesStructure } from "./schema/localization.js";
import { readFile } from "./utils/index.js";

export async function getLocalizationFiles(localizationPaths: string[]): Promise<[string, Buffer][]> {
    const results = await Promise.all(
        localizationPaths.map(async (pth) => {
            return await glob(path.join(pth, "*.json"));
        }),
    );

    const localizationFileNames = results.flat();
    const buffers = await Promise.all(
        localizationFileNames.map((localizationFileName) => readFile(localizationFileName)),
    );

    return localizationFileNames.map((fileName, i) => [fileName, buffers[i]]);
}

export function getParsedLocalizations(
    localizations: Array<[string, Buffer]>,
): Array<[string, LocalesStructure]> {
    return localizations.map(([filename, localization]) => [filename, JSON.parse(localization.toString())]);
}

export function getLocalizationValues(localizations: Array<[string, LocalesStructure]>): Array<string> {
    const mergedLocalizationValues: Array<LocalesItem | string> = localizations.flatMap(([, localization]) =>
        Object.values(localization),
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
