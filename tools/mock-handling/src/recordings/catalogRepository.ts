// (C) 2007-2025 GoodData Corporation
import * as path from "path";

import { flatMap } from "lodash-es";

import { CatalogDefinition, CatalogRecording } from "./catalog.js";
import { IRecording, isNonNullRecording } from "./common.js";
import { findFiles } from "../base/utils.js";
import { logWarn } from "../cli/loggers.js";

function createRecording(directory: string): IRecording | null {
    try {
        return new CatalogRecording(directory);
    } catch (e) {
        logWarn(
            `An error has occurred while loading catalog recording from directory ${directory}: ${e} - the recording will not be included in further processing.`,
        );

        return null;
    }
}

function loadRecordings(recordingDefinition: string): IRecording[] {
    const directory = path.dirname(recordingDefinition);

    return [createRecording(directory)].filter(isNonNullRecording);
}

export async function discoverCatalogRecordings(recordingDir: string): Promise<IRecording[]> {
    return flatMap(findFiles(recordingDir, CatalogDefinition), loadRecordings);
}
