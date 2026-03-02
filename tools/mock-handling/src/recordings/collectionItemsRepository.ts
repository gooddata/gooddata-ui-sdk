// (C) 2007-2026 GoodData Corporation

import fs from "fs";
import path from "path";

import { CollectionItemsRecording } from "./collectionItems.js";
import { type IRecording, isNonNullRecording } from "./common.js";
import { findFiles } from "../base/utils.js";
import { logWarn } from "../cli/loggers.js";

const CollectionItemsDirName = "collectionItems";
const CollectionItemsResultFile = "result.json";

function loadRecording(recordingFile: string): IRecording | null {
    const directory = path.dirname(recordingFile);

    try {
        return new CollectionItemsRecording(directory);
    } catch (e) {
        logWarn(
            `An error has occurred while loading collection items recording from directory ${directory}: ${e} - the recording will not be included in further processing.`,
        );

        return null;
    }
}

export function discoverCollectionItemsRecordings(recordingDir: string): IRecording[] {
    const collectionItemsDir = path.join(recordingDir, "uiTestScenarios", CollectionItemsDirName);
    if (!fs.existsSync(collectionItemsDir)) {
        return [];
    }

    return findFiles(collectionItemsDir, CollectionItemsResultFile)
        .map(loadRecording)
        .filter(isNonNullRecording);
}
