// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";
import {
    ChartElementType,
    ChartType,
    HeadlineElementType,
    HeadlineType,
    TableElementType,
    TableType,
} from "../constants/visualizationTypes";

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

export type IDrillEventCallback = (event: IDrillEvent) => void | boolean;

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
}

// Drill context for chart element group (multiple series + click on axis value)
// where every point has own intersection
export interface IDrillEventContextGroup {
    type: ChartType;
    element: ChartElementType;
    points: IDrillPoint[];
}

// Drill context for all visualization types
export type DrillEventContext =
    | IDrillEventContextTable
    | IDrillEventContextHeadline
    | IDrillEventContextPoint
    | IDrillEventContextGroup;

// IDrillEvent is a parameter of the onFiredDrillEvent is callback
export interface IDrillEvent {
    executionContext: AFM.IAfm;
    drillContext: DrillEventContext;
}
