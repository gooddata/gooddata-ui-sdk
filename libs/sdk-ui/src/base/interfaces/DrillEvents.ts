// (C) 2007-2019 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import { TableRowForDrilling } from "../../pivotTable/types";
import {
    ChartElementType,
    ChartType,
    HeadlineElementType,
    HeadlineType,
    TableElementType,
    TableType,
    VisElementType,
    VisType,
} from "../constants/visualizationTypes";
import { OnFiredDrillEvent2 } from "./Events";

export interface IDrillableItemUri {
    uri: string;
}

export interface IDrillableItemIdentifier {
    identifier: string;
}

export type IDrillableItem =
    | IDrillableItemUri
    | IDrillableItemIdentifier
    | (IDrillableItemUri & IDrillableItemIdentifier);

export function isDrillableItemUri(item: IDrillableItem): item is IDrillableItemUri {
    return (item as IDrillableItemUri).uri !== undefined;
}

export function isDrillableItemIdentifier(item: IDrillableItem): item is IDrillableItemIdentifier {
    return (item as IDrillableItemIdentifier).identifier !== undefined;
}

export type IDrillEventCallback2 = (event: IDrillEvent2) => void | boolean;

// Intersection element
export interface IDrillEventIntersectionElement {
    id: string;
    title: string;
    header?: {
        uri: string;
        identifier: string;
    };
}

// Drill context for tables
export interface IDrillEventContextTable {
    type: TableType;
    element: TableElementType;
    columnIndex: number;
    rowIndex: number;
    row: any[];
    intersection: IDrillEventIntersectionElement[];
}

// Drill context for headline
export interface IDrillEventContextHeadline {
    type: HeadlineType;
    element: HeadlineElementType;
    value: string;
    intersection: IDrillEventIntersectionElement[];
}

// Drill context for chart
export interface IDrillEventContextPoint {
    type: ChartType;
    element: ChartElementType;
    elementChartType?: ChartType;
    x?: number;
    y?: number;
    z?: number;
    value?: string;
    intersection: IDrillEventIntersectionElement[];
}

// Chart series point with intersection element
export interface IDrillPoint {
    x: number;
    y: number;
    intersection: IDrillEventIntersectionElement[];
    type?: ChartType;
}

// Drill context for chart element group (multiple series + click on axis value)
// where every point has own intersection
export interface IDrillEventContextGroup {
    type: ChartType;
    element: ChartElementType;
    points: IDrillPoint[];
}

// Drill context for all visualization types
export interface IDrillEventContext {
    type: VisType; // type of visualization
    element: VisElementType; // type of visualization element drilled
    x?: number; // chart x coordinate (if supported)
    y?: number; // chart y coordinate (if supported)
    z?: number; // chart z coordinate (if supported)
    columnIndex?: number;
    rowIndex?: number;
    row?: any[]; // table row data of the drilled row
    value?: string; // cell or element value drilled
    // some drill headers that are relevant for current drill element
    intersection?: IDrillEventIntersectionElement[];
    // A collection of chart series points (if available)
    points?: IDrillPoint[];
}

export interface IDrillEvent2 {
    dataView: IDataView;
    drillContext: IDrillEventContext;
}

export interface IHighchartsParentTick {
    leaves: number;
    startAt: number;
    label: any;
}

export interface IHighchartsCategoriesTree {
    tick: IHighchartsParentTick;
}

export interface ICellDrillEvent {
    columnIndex: number;
    rowIndex: number;
    row: TableRowForDrilling;
    intersection: IDrillEventIntersectionElement[];
}

export interface IDrillConfig {
    dataView: IDataView;
    onDrill: OnFiredDrillEvent2;
}
