// (C) 2019-2020 GoodData Corporation
import {
    IExecutionDefinition,
    IAttributeDisplayForm,
    IAttributeElement,
    IInsight,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export type RecordingIndex = {
    executions?: {
        [fp: string]: ExecutionRecording;
    };
    metadata?: {
        displayForms?: { [id: string]: DisplayFormRecording };
        insights?: { [id: string]: InsightRecording };
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

/**
 * @internal
 */
export type InsightRecording = {
    obj: IInsight;
};
