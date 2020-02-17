// (C) 2019-2020 GoodData Corporation
import { AnalyticalBackendConfig, ISettings } from "@gooddata/sdk-backend-spi";
import {
    IExecutionDefinition,
    IAttributeDisplayForm,
    IAttributeElement,
    IInsight,
    IColorPalette,
} from "@gooddata/sdk-model";

/**
 * Recorded backend allows convenient programmatic configuration of some services outcomes.
 *
 * @internal
 */
export type RecordedBackendConfig = AnalyticalBackendConfig & {
    /**
     * Specify settings that will be returned by any settings service (e.g. workspace settings)
     */
    globalSettings?: ISettings;

    /**
     * Specify color palette to return
     */
    globalPalette?: IColorPalette;
};

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
    scenarios?: any[];
    definition: IExecutionDefinition;
    executionResult: any;
    [dataViews: string]: any;
};

/**
 * @internal
 */
export type ScenarioRecording = {
    execution: ExecutionRecording;
    scenarioIndex: number;
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
