// (C) 2019-2020 GoodData Corporation
import {
    CatalogItem,
    IAnalyticalBackendConfig,
    IAttributeDisplayFormMetadataObject,
    IAttributeElement,
    ICatalogGroup,
    ISettings,
    ITheme,
} from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition, IInsight, IColorPalette, IVisualizationClass } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type RecordedRefType = "id" | "uri";

/**
 * Recorded backend allows convenient programmatic configuration of some services outcomes.
 *
 * @internal
 */
export type RecordedBackendConfig = IAnalyticalBackendConfig & {
    /**
     * Specify settings that will be returned by any settings service (e.g. workspace settings)
     */
    globalSettings?: ISettings;

    /**
     * Specify color palette to return
     */
    globalPalette?: IColorPalette;

    /**
     * Specify theme to return
     */
    theme?: ITheme;

    /**
     * Specify which ref type should be added to recorded entities. Recording infrastructure does not
     * store 'ref'. Instead, the recorded backend can return refs as either uri or identifier, thus allowing
     * to simulate behavior of the different backend types.
     *
     * Note: this is currently implemented for executions and insights. it is not yet supported in catalog
     *
     * Default: 'uri'
     */
    useRefType?: RecordedRefType;
};

/**
 * @internal
 */
export type RecordingIndex = {
    executions?: {
        [fp: string]: ExecutionRecording;
    };
    metadata?: {
        catalog?: CatalogRecording;
        displayForms?: { [id: string]: DisplayFormRecording };
        insights?: { [id: string]: InsightRecording };
        visClasses?: VisClassesRecording;
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
    obj: IAttributeDisplayFormMetadataObject;
    elements: IAttributeElement[];
};

/**
 * @internal
 */
export type InsightRecording = {
    obj: IInsight;
};

/**
 * @internal
 */
export type CatalogRecording = {
    items: CatalogItem[];
    groups: ICatalogGroup[];
};

/**
 * @internal
 */
export type VisClassesRecording = {
    items: IVisualizationClass[];
};
