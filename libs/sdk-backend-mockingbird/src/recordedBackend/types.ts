// (C) 2019 GoodData Corporation
import { IExecutionDefinition, IAttributeDisplayForm, IAttributeElement } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type RecordingIndex = {
    executions?: {
        [fp: string]: ExecutionRecording;
    };
    metadata?: {
        displayForms?: { [id: string]: DisplayFormRecording };
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

/**
 * @internal
 */
export type DisplayFormRecording = {
    obj: IAttributeDisplayForm;
    elements: IAttributeElement[];
};
