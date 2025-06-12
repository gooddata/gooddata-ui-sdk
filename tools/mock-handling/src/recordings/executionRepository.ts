// (C) 2007-2020 GoodData Corporation
import * as path from "path";
import { findFiles } from "../base/utils.js";
import { logWarn } from "../cli/loggers.js";
import { IRecording, isNonNullRecording } from "./common.js";
import { ExecutionRecording } from "./execution.js";
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

export async function discoverExecutionRecordings(recordingDir: string): Promise<IRecording[]> {
    return findFiles(recordingDir, RecordingFiles.Execution.Definition)
        .map(loadRecording)
        .filter(isNonNullRecording);
}
