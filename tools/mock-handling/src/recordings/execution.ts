// (C) 2007-2022 GoodData Corporation

import {
    defFingerprint,
    IExecutionDefinition,
    IDimensionDescriptor,
    isAttributeDescriptor,
} from "@gooddata/sdk-model";
import { IAnalyticalBackend, IDataView, IExecutionResult } from "@gooddata/sdk-backend-spi";
import * as fs from "fs";
import * as path from "path";
import { logWarn } from "../cli/loggers.js";
import { IRecording, readJsonSync, RecordingIndexEntry, RecordingType, writeAsJsonSync } from "./common.js";
import { DataViewRequests, RecordingFiles, RequestedWindow, ScenarioDescriptor } from "../interface.js";
import isArray from "lodash/isArray.js";
import isEmpty from "lodash/isEmpty.js";
import isObject from "lodash/isObject.js";
import pickBy from "lodash/pickBy.js";

//
// internal constants & types
//

const ExecutionResultFile = "executionResult.json";
const DataViewAllFile = "dataView_all.json";
const DataViewWindowFile = (win: RequestedWindow) => `dataView_${dataViewWindowId(win)}.json`;
const dataViewWindowId = (win: RequestedWindow) => `o${win.offset.join("_")}s${win.size.join("_")}`;
const DefaultDataViewRequests: DataViewRequests = {
    allData: true,
};
/**
 * Properties of data view to serialize into the recording; everything else is functions or derivable / provided at runtime
 */
const DataViewPropsToSerialize: Array<keyof IDataView> = [
    "data",
    "headerItems",
    "totals",
    "totalTotals",
    "count",
    "offset",
    "totalCount",
];

type DataViewFiles = {
    [filename: string]: RequestedWindow | "all";
};

//
// loading and verifying data from filesystem
//

function loadDefinition(directory: string): [IExecutionDefinition, string] {
    const fingerprint = path.basename(directory);
    const definition = readJsonSync(
        path.join(directory, RecordingFiles.Execution.Definition),
    ) as IExecutionDefinition;
    const calculatedFingerprint = defFingerprint(definition);

    if (calculatedFingerprint !== fingerprint) {
        logWarn(`The actual fingerprint ('${calculatedFingerprint}') of the execution definition stored in ${directory} does not match the directory in which it is stored.
        If you created this definition manually then you do not have to worry about this warning. If this definition is supposed to be created
        by automation (such as the populate-ref scripts) then it indicates manual tampering.`);
    }

    return [definition, calculatedFingerprint];
}

// TODO: replace these weak validations with proper json-schema validation
function loadScenarios(directory: string): ScenarioDescriptor[] {
    const scenariosFile = path.join(directory, RecordingFiles.Execution.Scenarios);

    if (!fs.existsSync(scenariosFile)) {
        return [];
    }

    try {
        const scenarios = readJsonSync(scenariosFile);

        if (!isArray(scenarios)) {
            logWarn(
                `The ${RecordingFiles.Execution.Scenarios} in ${directory} does not contain JSON array with scenario metadata. Proceeding without scenarios - they will not be included for this particular recording. `,
            );

            return [];
        }

        const validScenarios = scenarios.filter(
            (s) => s.vis !== undefined && s.scenario !== undefined,
        ) as ScenarioDescriptor[];

        if (validScenarios.length !== scenarios.length) {
            logWarn(
                `The ${RecordingFiles.Execution.Scenarios} in ${directory} does not contain valid scenario metadata. Some or even all metadata have invalid shape. This comes as object with 'vis' and 'scenario' string properties. Proceeding without scenarios - they will not be included for this particular recording.`,
            );
        }

        return validScenarios;
    } catch (e) {
        logWarn(
            `Unable to read or parse ${RecordingFiles.Execution.Scenarios} in ${directory}: ${e}; it is likely that the file is malformed. It should contain JSON with array of {vis, scenario} objects. Proceeding without scenarios - they will not be included for this particular recording.`,
        );

        return [];
    }
}

// TODO: replace these weak validations with proper json-schema validation
function loadDataViewRequests(directory: string): DataViewRequests {
    const requestsFile = path.join(directory, RecordingFiles.Execution.Requests);

    if (!fs.existsSync(requestsFile)) {
        return DefaultDataViewRequests;
    }

    try {
        const requests = readJsonSync(requestsFile) as DataViewRequests;

        if (!isObject(requests) || (requests.allData === undefined && requests.windows === undefined)) {
            logWarn(
                `The ${RecordingFiles.Execution.Requests} in ${directory} does not contain valid data view request definitions. It should contain JSON with object with allData: boolean and/or windows: [{offset, size}]. Proceeding with default: getting all data.`,
            );

            return DefaultDataViewRequests;
        }

        // feeling lucky.. the file may still be messed up
        return requests;
    } catch (e) {
        logWarn(
            `Unable to read or parse ${RecordingFiles.Execution.Requests} in ${directory}: ${e}; it is likely that the file is malformed. It should contain JSON with object with allData: boolean and/or windows: [{offset, size}]. Proceeding with default: getting all data.`,
        );

        return DefaultDataViewRequests;
    }
}

//
// Public API
//

export class ExecutionRecording implements IRecording {
    public readonly fingerprint: string;
    public readonly definition: IExecutionDefinition;
    public readonly scenarios: ScenarioDescriptor[];
    public readonly directory: string;

    private readonly dataViewRequests: DataViewRequests;

    constructor(directory: string) {
        this.directory = directory;
        const [definition, fingerprint] = loadDefinition(directory);

        this.definition = definition;
        this.fingerprint = fingerprint;

        this.scenarios = loadScenarios(directory);
        this.dataViewRequests = loadDataViewRequests(directory);
    }

    public getRecordingType(): RecordingType {
        return RecordingType.Execution;
    }

    public getRecordingName(): string {
        return `fp_${this.fingerprint}`;
    }

    public isComplete(): boolean {
        return this.hasResult() && this.hasAllDataViewFiles();
    }

    public alwaysRefresh(): boolean {
        return true;
    }

    public async makeRecording(
        backend: IAnalyticalBackend,
        workspace: string,
        newWorkspaceId?: string,
    ): Promise<void> {
        // exec definitions are stored with some test workspace in them; make sure the exec definition that will actually
        //  contain ID of workspace specified by the user
        const workspaceBoundDef: IExecutionDefinition = {
            ...this.definition,
            workspace,
            postProcessing: undefined, // Ignore postProcessing property as it is irrelevant to the server side
        };

        const replaceString: [string, string] | undefined = newWorkspaceId
            ? [workspace, newWorkspaceId]
            : undefined;

        const result: IExecutionResult = await backend
            .workspace(workspace)
            .execution()
            .forDefinition(workspaceBoundDef)
            .execute();

        /*
         * Do not store refs for the dimension descriptors. Instead, let the recording backend reconstruct
         * the ref and allow choice to reconstruct either idRef or uriRef. This allows more flexibility for
         * tests + means existing test data is reusable and does not need to be regenerated.
         */
        const resultWithoutRefs = stripRefsFromDimensions(result.dimensions);

        writeAsJsonSync(
            path.join(this.directory, ExecutionResultFile),
            { dimensions: resultWithoutRefs },
            {
                replaceString,
            },
        );

        const missingFiles = Object.entries(this.getRequiredDataViewFiles());

        for (const [filename, requestType] of missingFiles) {
            let dataView;

            if (requestType === "all") {
                dataView = await result.readAll();
            } else {
                dataView = await result.readWindow(requestType.offset, requestType.size);
            }

            writeAsJsonSync(filename, dataView, { pickKeys: DataViewPropsToSerialize, replaceString });
        }
    }

    public getEntryForRecordingIndex(): RecordingIndexEntry {
        const dataViewFiles: RecordingIndexEntry = Object.keys(this.getRequiredDataViewFiles()).reduce(
            (acc: RecordingIndexEntry, filename) => {
                acc[path.basename(filename, ".json")] = filename;

                return acc;
            },
            {},
        );

        const entry: RecordingIndexEntry = {
            definition: path.join(this.directory, RecordingFiles.Execution.Definition),
            executionResult: path.join(this.directory, ExecutionResultFile),
            ...dataViewFiles,
        };

        const scenariosFile = path.join(this.directory, RecordingFiles.Execution.Scenarios);
        if (fs.existsSync(scenariosFile)) {
            entry.scenarios = scenariosFile;
        }

        return entry;
    }

    private hasResult(): boolean {
        const resultFile = path.join(this.directory, ExecutionResultFile);

        return fs.existsSync(resultFile);
    }

    private hasAllDataViewFiles(): boolean {
        return isEmpty(Object.keys(this.getMissingDataViewFiles()));
    }

    private getMissingDataViewFiles(): DataViewFiles {
        return pickBy(this.getRequiredDataViewFiles(), (_, filename) => !fs.existsSync(filename));
    }

    private getRequiredDataViewFiles(): DataViewFiles {
        const files: DataViewFiles = {};

        if (this.dataViewRequests.allData) {
            const filename = path.join(this.directory, DataViewAllFile);

            files[filename] = "all";
        }

        if (this.dataViewRequests.windows) {
            this.dataViewRequests.windows.forEach((win) => {
                const filename = path.join(this.directory, DataViewWindowFile(win));

                files[filename] = win;
            });
        }

        return files;
    }
}

function stripRefsFromDimensions(dims: IDimensionDescriptor[]) {
    dims.forEach((dim) => {
        dim.headers.forEach((descriptor) => {
            if (isAttributeDescriptor(descriptor)) {
                // @ts-expect-error we can deal with deleting this, the resulting object is used only for writing to a file
                delete descriptor.attributeHeader.ref;
                // @ts-expect-error we can deal with deleting this, the resulting object is used only for writing to a file
                delete descriptor.attributeHeader.formOf.ref;
            } else {
                descriptor.measureGroupHeader.items.forEach((measure) => {
                    delete measure.measureHeaderItem.ref;
                });
            }
        });
    });

    return dims;
}
