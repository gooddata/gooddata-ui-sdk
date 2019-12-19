// (C) 2007-2019 GoodData Corporation
import * as fs from "fs";
import * as path from "path";
import { logInfo, logWarn } from "../cli/loggers";
import { ExecutionDefinitionFile, ExecutionRecording } from "./execution";
import { IRecording } from "./common";

export const ExecutionRecordingDir = "executions";

function locateDefinitions(executionsDir: string): string[] {
    const entries = fs.readdirSync(executionsDir, { withFileTypes: true, encoding: "utf-8" });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(executionsDir, entry.name);

        if (entry.isDirectory()) {
            files.push(...locateDefinitions(fullPath));
        } else if (entry.isFile() && entry.name === ExecutionDefinitionFile) {
            files.push(fullPath);
        }
    }

    return files;
}

function loadRecording(recordingDefinition: string): ExecutionRecording | null {
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

function isNonNullRecording(obj: any): obj is ExecutionRecording {
    return obj !== null;
}

export async function discoverExecutionRecordings(recordingDir: string): Promise<IRecording[]> {
    const executionsDir = path.join(recordingDir, ExecutionRecordingDir);

    if (!fs.existsSync(executionsDir)) {
        logInfo(
            `Recordings directory contains no '${ExecutionRecordingDir}' subdir - assuming no executions to record`,
        );

        return [];
    } else if (!fs.statSync(executionsDir).isDirectory()) {
        logWarn(
            `Recordings directory contains '${ExecutionRecordingDir}' but it is not a directory - this is likely a problem in your recordings organization. No execution recordings will be captured.`,
        );

        return [];
    }

    return (await locateDefinitions(executionsDir)).map(loadRecording).filter(isNonNullRecording);
}
