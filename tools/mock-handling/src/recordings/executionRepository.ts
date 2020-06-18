// (C) 2007-2020 GoodData Corporation
import * as path from "path";
import { findFiles } from "../base/utils";
import { logWarn } from "../cli/loggers";
import { IRecording, isNonNullRecording } from "./common";
import { ExecutionDefinitionFile, ExecutionRecording } from "./execution";

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
    return findFiles(recordingDir, ExecutionDefinitionFile).map(loadRecording).filter(isNonNullRecording);
}
