// (C) 2007-2021 GoodData Corporation
import { GdcVisualizationObject } from "../visualizationObject/GdcVisualizationObject";
import isEmpty from "lodash/isEmpty";

/**
 * @public
 */
export namespace GdcDashboardLayout {
    export type Layout = IFluidLayout;
    export type Widget = IPersistedWidget;
    export type LayoutContent = Widget | Layout;

    export interface IPersistedWidget {
        widget: {
            qualifier: GdcVisualizationObject.ObjQualifier;
        };
    }

    export interface IFluidLayout {
        fluidLayout: {
            rows: IFluidLayoutRow[];
            size?: IFluidLayoutSize;
            style?: string;
        };
    }

    export interface IFluidLayoutRow {
        columns: IFluidLayoutColumn[];
        style?: string;
        header?: SectionHeader;
    }

    export interface IFluidLayoutColumn {
        content?: LayoutContent;
        size: IFluidLayoutColSize;
        style?: string;
    }

    export interface IFluidLayoutColSize {
        xl: IFluidLayoutSize;
        xs?: IFluidLayoutSize;
        sm?: IFluidLayoutSize;
        md?: IFluidLayoutSize;
        lg?: IFluidLayoutSize;
    }

    export interface IFluidLayoutSize {
        width: number;
        height?: number;
        heightAsRatio?: number;
    }

    export type SectionHeader = ISectionHeader | ISectionDescription;

    export interface ISectionHeader {
        title: string;
        description?: string;
    }

    export interface ISectionDescription {
        description: string;
    }

    export function isFluidLayout(obj: unknown): obj is IFluidLayout {
        return !isEmpty(obj) && !!(obj as IFluidLayout).fluidLayout;
    }

    export function isLayoutWidget(obj: unknown): obj is IPersistedWidget {
        return !isEmpty(obj) && !!(obj as IPersistedWidget).widget;
    }
}
