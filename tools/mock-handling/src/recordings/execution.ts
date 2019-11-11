// (C) 2007-2019 GoodData Corporation

import { defFingerprint, IExecutionDefinition } from "@gooddata/sdk-model";
import {
    IAnalyticalBackend,
    IDataView,
    IExecutionFactory,
    IExecutionResult,
} from "@gooddata/sdk-backend-spi";
import * as fs from "fs";
import * as path from "path";
import { logInfo, logWarn } from "../cli/loggers";
import { DataRecorderConfig } from "../base/types";
import pmap from "p-map";
import pick = require("lodash/pick");

export const ExecutionRecordingDir = "executions";
export const ExecutionDefinitionFile = "definition.json";
export const ExecutionResultFile = "executionResult.json";
export const DataViewFile = "dataView_all.json";

/**
 * Properties of execution result to serialize into the recording; everything else is functions or derivable / provided at runtime
 */
const ExecutionResultPropsToSerialize: Array<keyof IExecutionResult> = ["dimensions"];

/**
 * Properties of data view to serialize into the recording; everything else is functions or derivable / provided at runtime
 */
const DataViewPropsToSerialize: Array<keyof IDataView> = [
    "data",
    "headerItems",
    "totals",
    "count",
    "offset",
    "totalCount",
];

export interface IExecutionRecording {
    directory: string;
    fingerprint: string;
    definition: IExecutionDefinition;
    definitionFile: string;
    resultFile: string;
    dataViewFile: string;
    hasRecordedData: boolean;

    makeRecording(execFactory: IExecutionFactory, workspace: string): Promise<IExecutionRecording>;
}

export type OnRecordingCaptured = (recording: IExecutionRecording, error?: string) => void;

//
//
//

function isValidExecutionTask(obj: any): obj is IExecutionRecording {
    return obj !== null;
}

function serializeExecutionResult(result: IExecutionResult): any {
    return JSON.stringify(pick(result, ExecutionResultPropsToSerialize), null, 4);
}

function serializeDataView(dataView: IDataView): any {
    return JSON.stringify(pick(dataView, DataViewPropsToSerialize), null, 4);
}

// @ts-ignore
async function makeRecording(
    rec: IExecutionRecording,
    execFactory: IExecutionFactory,
    workspace: string,
): Promise<IExecutionRecording> {
    // exec definitions are stored with some test workspace in them; make sure the exec definition that will actually
    //  contain ID of workspace specified by the user
    const workspaceBoundDef: IExecutionDefinition = {
        ...rec.definition,
        workspace,
    };

    const result: IExecutionResult = await execFactory.forDefinition(workspaceBoundDef).execute();
    const allDataView: IDataView = await result.readAll();

    fs.writeFileSync(rec.resultFile, serializeExecutionResult(result), { encoding: "utf-8" });
    fs.writeFileSync(rec.dataViewFile, serializeDataView(allDataView), { encoding: "utf-8" });

    return {
        ...rec,
        hasRecordedData: true,
    };
}

function load(definitionFile: string): IExecutionRecording | null {
    const directory = path.dirname(definitionFile);
    let fingerprint = path.basename(directory);
    const definition = JSON.parse(
        fs.readFileSync(definitionFile, { encoding: "utf-8" }),
    ) as IExecutionDefinition;
    const calculatedFingerprint = defFingerprint(definition);

    if (defFingerprint(definition) !== fingerprint) {
        logWarn(`The actual fingerprint ('${calculatedFingerprint}') of the execution definition stored in ${directory} does not match the directory in which it is stored. 
        If you created this definition manually then you do not have to worry about this warning. If this definition is supposed to be created
        by automation (such as the write-exec-defs scripts) then it indicates manual tampering.`);

        fingerprint = calculatedFingerprint;
    }

    const resultFile = path.join(directory, ExecutionResultFile);
    const dataViewFile = path.join(directory, DataViewFile);

    const executionTask = {
        directory,
        fingerprint,
        definition,
        definitionFile,
        resultFile,
        dataViewFile,
        hasRecordedData: fs.existsSync(resultFile) && fs.existsSync(dataViewFile),
        makeRecording: async (execFactory: IExecutionFactory, workspace: string) =>
            makeRecording(executionTask, execFactory, workspace),
    };

    return executionTask;
}

async function locateDefinitions(executionsDir: string): Promise<string[]> {
    const entries = await fs.readdirSync(executionsDir, { withFileTypes: true, encoding: "utf-8" });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(executionsDir, entry.name);

        if (entry.isDirectory()) {
            files.push(...(await locateDefinitions(fullPath)));
        } else if (entry.isFile() && entry.name === ExecutionDefinitionFile) {
            files.push(fullPath);
        }
    }

    return files;
}

export async function discoverExecutionRecordings(recordingDir: string): Promise<IExecutionRecording[]> {
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

    return (await locateDefinitions(executionsDir)).map(load).filter(isValidExecutionTask);
}

export async function populateExecutionRecordings(
    recordings: IExecutionRecording[],
    backend: IAnalyticalBackend,
    config: DataRecorderConfig,
    onCaptured: OnRecordingCaptured,
): Promise<IExecutionRecording[]> {
    const executionFactory = backend.workspace(config.projectId!).execution();

    return pmap(
        recordings,
        rec => {
            return rec
                .makeRecording(executionFactory, config.projectId!)
                .then(completedRec => {
                    onCaptured(completedRec);

                    return completedRec;
                })
                .catch(err => {
                    onCaptured(
                        rec,
                        `An error '${err}' has occurred while obtaining data for recording in ${rec.definitionFile}; it is highly likely that the execution definition is semantically incorrect and leads to un-executable input. Suggestion: try it out in Analytical Designer.`,
                    );

                    return rec;
                });
        },
        { concurrency: 4 },
    );
}
