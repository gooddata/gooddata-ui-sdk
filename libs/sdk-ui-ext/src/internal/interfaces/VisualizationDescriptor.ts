// (C) 2021-2022 GoodData Corporation
import { IAnalyticalBackend, ISettings, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { IColorPalette, IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import { IFluidLayoutDescriptor } from "./LayoutDescriptor";
import { IDrillDownContext, IVisConstruct, IVisualization } from "./Visualization";

/**
 * Factories that create a new instance of pluggable visualization.
 *
 * @alpha
 */
export type PluggableVisualizationFactory = (params: IVisConstruct) => IVisualization;

/**
 * Info about min, max and default in layout units.
 * If no value is provided for min/max/default layout will use its generic defaults for it.
 *
 * @alpha
 */
export interface ISizeInfo {
    default?: number;
    min?: number;
    max?: number;
}

/**
 * Info about visualization's min, max and default for width and height.
 *
 * @alpha
 */
export interface IVisualizationSizeInfo {
    width: ISizeInfo;
    height: ISizeInfo;
}

/**
 * Context of the embedding code generation.
 *
 * @alpha
 */
export interface IEmbeddingCodeContext {
    /**
     * The backend that will be used to determine the capabilities of it.
     * Should be the same type and version as the one that will be used in the target application.
     * If not provided, any backend-dependent properties MUST be ignored in the code generator.
     */
    backend?: IAnalyticalBackend;

    /**
     * Settings of the current user.
     * If not provided, any user specific-settings MUST be ignored in the code generator.
     */
    settings?: IUserWorkspaceSettings;

    /**
     * The color palette to use when rendering the visualization.
     * If not provided, the default color palette will be used.
     */
    colorPalette?: IColorPalette;
}

/**
 * Configuration of the embedding code generation.
 *
 * @alpha
 */
export interface IEmbeddingCodeConfig {
    /**
     * Desired height of the resulting component.
     * If not specified, a sane default will be used.
     */
    height?: number | string;
    /**
     * Context of the embedding code generation.
     * If provided, the code generator can use it to fine tune the resulting code.
     */
    context?: IEmbeddingCodeContext;
    /**
     * The language of the resulting code.
     * Defaults to "ts"
     */
    language?: "ts" | "js";
}

/**
 * @alpha
 * Visualization descriptor
 * Provides access to the visualization's factory and additional details about visualization
 */
export interface IVisualizationDescriptor {
    /**
     * Gets pluggable visualization factory.
     *
     * @alpha
     */
    getFactory(): PluggableVisualizationFactory;

    /**
     * Gets info about size of visualization based on its type, bucket content, layout context and if custom height is enabled.
     * Provided info is used by layout and it defines what will be the default size during render of insight and what will be the limits during resizing of insight.
     *
     * @param insight - Current insight definition
     * @param layoutDescriptor - layout creating context for visualization
     * @param settings - to know if custom heights are allowed
     * @alpha
     */
    getSizeInfo(
        insight: IInsightDefinition,
        layoutDescriptor: IFluidLayoutDescriptor,
        settings: ISettings,
    ): IVisualizationSizeInfo;

    /**
     * Modifies buckets and filters of the insight according to the particular drill down context.
     *
     * The exact contract depends on individual {@link @gooddata/sdk-model#IInsight} type, but generally it should replace
     * the drilled attribute with the Drill Down target target attribute and include the filters from the
     * drill event into the returned {@link @gooddata/sdk-model#IInsight}.
     *
     * @param insight - {@link @gooddata/sdk-model#IInsight} to be used for the the drill down application
     * @param drillDownContext - drill down configuration used to properly create the result
     * @returns {@link @gooddata/sdk-model#IInsight} with modified buckets and filters according to the provided drill down context.
     */
    applyDrillDown(insight: IInsight, drillDownContext: IDrillDownContext): IInsight;

    /**
     * When called, returns a source code that can be used to embed the visualization in a custom application.
     *
     * @param insight - the insight to generate the embedding code for
     * @param config - configuration of the resulting code
     * @returns the source code as a string
     */
    getEmbeddingCode?(insight: IInsightDefinition, config?: IEmbeddingCodeConfig): string;
}
