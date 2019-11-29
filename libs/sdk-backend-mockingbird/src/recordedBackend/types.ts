// (C) 2019 GoodData Corporation
import { IExecutionDefinition, IAttributeDisplayForm, IAttributeElement } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type RecordingIndex = {
    [workspace: string]: WorkspaceRecordings;
};

/**
 * @internal
 */
export type WorkspaceRecordings = {
    executions?: {
        [fp: string]: ExecutionRecording;
    };
    metadata?: {
        attributeDisplayForm?: { [id: string]: IAttributeDisplayForm };
    };
    elements?: {
        [id: string]: IAttributeElement[];
    };
};

/**
 * @internal
 */
export type ExecutionRecording = {
    definition: IExecutionDefinition;
    executionResult: any;
    [dataViews: string]: any;
};
