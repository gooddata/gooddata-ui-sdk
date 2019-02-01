// (C) 2007-2019 GoodData Corporation
import { VisualizationObject } from './VisualizationObject';

export type Layout = IFluidLayout;

export type Widget = IPersistedWidget;

export type LayoutContent = Widget | Layout;

export interface IPersistedWidget {
   widget: {
       qualifier: VisualizationObject.ObjQualifier;
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
 }

export interface IFluidLayoutColumn {
    content: LayoutContent;
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
    heightAsRatio?: number;
 }
