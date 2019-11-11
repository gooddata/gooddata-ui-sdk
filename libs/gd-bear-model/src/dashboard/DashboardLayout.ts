// (C) 2007-2019 GoodData Corporation
import { VisualizationObject } from "../visualizationObject/VisualizationObject";

/**
 * @internal
 */
export type Layout = IFluidLayout;

/**
 * @internal
 */
export type Widget = IPersistedWidget;

/**
 * @internal
 */
export type LayoutContent = Widget | Layout;

/**
 * @internal
 */
export interface IPersistedWidget {
    widget: {
        qualifier: VisualizationObject.ObjQualifier;
    };
}

/**
 * @internal
 */
export interface IFluidLayout {
    fluidLayout: {
        rows: IFluidLayoutRow[];
        size?: IFluidLayoutSize;
        style?: string;
    };
}

/**
 * @internal
 */
export interface IFluidLayoutRow {
    columns: IFluidLayoutColumn[];
    style?: string;
    header?: SectionHeader;
}

/**
 * @internal
 */
export interface IFluidLayoutColumn {
    content?: LayoutContent;
    size: IFluidLayoutColSize;
    style?: string;
}

/**
 * @internal
 */
export interface IFluidLayoutColSize {
    xl: IFluidLayoutSize;
    xs?: IFluidLayoutSize;
    sm?: IFluidLayoutSize;
    md?: IFluidLayoutSize;
    lg?: IFluidLayoutSize;
}

/**
 * @internal
 */
export interface IFluidLayoutSize {
    width: number;
    heightAsRatio?: number;
}

/**
 * @internal
 */
export type SectionHeader = ISectionHeader | ISectionDescription;

/**
 * @internal
 */
export interface ISectionHeader {
    title: string;
    description?: string;
}

/**
 * @internal
 */
export interface ISectionDescription {
    description: string;
}
