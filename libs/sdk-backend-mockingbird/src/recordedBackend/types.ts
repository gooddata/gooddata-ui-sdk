// (C) 2019 GoodData Corporation
import { IExecutionDefinition, IAttributeDisplayForm } from "@gooddata/sdk-model";
import { IElement } from "@gooddata/sdk-backend-spi";

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
        [id: string]: IElement[];
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
