// (C) 2007-2019 GoodData Corporation
import pmap from "p-map";
import * as fs from "fs";
import * as path from "path";
import { logInfo, logWarn } from "../cli/loggers";
import { DataRecorderConfig } from "../base/types";
import { ExecutionDefinitionFile, ExecutionRecording } from "./execution";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

export const ExecutionRecordingDir = "executions";
export type OnRecordingCaptured = (recording: ExecutionRecording, error?: string) => void;

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

export async function discoverExecutionRecordings(recordingDir: string): Promise<ExecutionRecording[]> {
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

export async function populateExecutionRecordings(
    recordings: ExecutionRecording[],
    backend: IAnalyticalBackend,
    config: DataRecorderConfig,
    onCaptured: OnRecordingCaptured,
): Promise<ExecutionRecording[]> {
    return pmap(
        recordings,
        rec => {
            return rec
                .makeRecording(backend, config.projectId!)
                .then(_ => {
                    onCaptured(rec);

                    return rec;
                })
                .catch(err => {
                    onCaptured(
                        rec,
                        `An error '${err}' has occurred while obtaining data for recording in ${rec.directory}; it is highly likely that the execution definition is semantically incorrect and leads to un-executable input. Suggestion: try it out in Analytical Designer.`,
                    );

                    return rec;
                });
        },
        { concurrency: 4 },
    );
}
