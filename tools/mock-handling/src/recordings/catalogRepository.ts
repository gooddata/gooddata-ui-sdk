// (C) 2007-2020 GoodData Corporation
import flatMap from "lodash/flatMap";
import * as path from "path";
import { findFiles } from "../base/utils";
import { logWarn } from "../cli/loggers";
import { IRecording, isNonNullRecording } from "./common";
import { CatalogRecording, CatalogDefinition } from "./catalog";

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
