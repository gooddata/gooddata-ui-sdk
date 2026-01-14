// (C) 2007-2026 GoodData Corporation

import * as path from "path";

import { type IRecording, isNonNullRecording } from "./common.js";
import { ExecutionRecording } from "./execution.js";
import { findFiles } from "../base/utils.js";
import { logWarn } from "../cli/loggers.js";
import { RecordingFiles } from "../interface.js";

function loadRecording(recordingDefinition: string): IRecording | null {
    const directory = path.dirname(recordingDefinition);

    try {
        return new ExecutionRecording(directory);
    } catch (e) {
        logWarn(
            `An error has occurred while loading execution recording from directory ${directory}: ${e} - the recording will not be included in further processing.`,
        );

        return null;
    }
}

export function discoverExecutionRecordings(recordingDir: string): IRecording[] {
    return findFiles(recordingDir, RecordingFiles.Execution.Definition)
        .map(loadRecording)
        .filter(isNonNullRecording);
}
