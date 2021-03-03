// (C) 2021 GoodData Corporation
import { ISettings } from "@gooddata/sdk-backend-spi";
import { IInsightDefinition } from "@gooddata/sdk-model";
import { IFluidLayoutDescriptor } from "./LayoutDescriptor";
import { IVisConstruct, IVisualization } from "./Visualization";

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
interface ISizeInfo {
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
     * @param insight Current insight definition
     * @param layoutDescriptor layout creating context for visualization
     * @param settings to know if custom heights are allowed
     * @alpha
     */
    getSizeInfo(
        insight: IInsightDefinition,
        layoutDescriptor: IFluidLayoutDescriptor,
        settings: ISettings,
    ): IVisualizationSizeInfo;
}
