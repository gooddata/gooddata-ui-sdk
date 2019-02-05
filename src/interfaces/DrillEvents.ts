// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from '@gooddata/typings';
import { VisElementType, VisType } from '../constants/visualizationTypes';

export interface IDrillableItemUri {
    uri: string;
}

export interface IDrillableItemIdentifier {
    identifier: string;
}

export type IDrillableItem =
    IDrillableItemUri |
    IDrillableItemIdentifier |
    (IDrillableItemUri & IDrillableItemIdentifier);

export function isDrillableItemUri(item: IDrillableItem): item is IDrillableItemUri {
    return (item as IDrillableItemUri).uri !== undefined;
}

export function isDrillableItemIdentifier(item: IDrillableItem): item is IDrillableItemIdentifier {
    return (item as IDrillableItemIdentifier).identifier !== undefined;
}

export type IDrillEventCallback = (event: IDrillEvent) => void | boolean;

// Chart series point with intersection element
export interface IDrillEventPoint {
    x: number;
    y: number;
    intersection: IDrillEventIntersectionElement[];
}

// Internal precursor to IDrillEventIntersectionElement
// TODO: Refactor internal drilling functions and replace with IDrillEventIntersectionElement
export interface ILegacyDrillIntersection {
    id: string; // attribute value id or measure localIndentifier
    title?: string;
    value?: Execution.DataValue; // text label of attribute value or formatted measure value
    name?: string;
    uri: string; // uri of measure
    identifier: AFM.Identifier; // identifier of attribute or measure
}

export interface IDrillEventContextBase {
    type: VisType; // type of visualization
    element: VisElementType; // type of visualization element drilled
    x?: number; // chart x coordinate (if supported)
    y?: number; // chart y coordinate (if supported)
    columnIndex?: number;
    rowIndex?: number;
    row?: any[]; // table row data of the drilled row
    value?: string; // cell or element value drilled
}

// Drill context for standard vsualization click
export interface IDrillEventContextSingle extends IDrillEventContextBase {
    intersection: IDrillEventIntersectionElement[]; // drill headers relevant for current drill element
}

// Drill context for group clicks (multiple series chart + click on axis value)
// Every point has own intersection
export interface IDrillEventContextGroup extends IDrillEventContextBase {
    points: IDrillEventPoint[]; // a collection of chart series points
}

export type DrillEventContext = IDrillEventContextSingle | IDrillEventContextGroup;

// IDrillEvent is a parameter of the onFiredDrillEvent is callback
export interface IDrillEvent {
    executionContext: AFM.IAfm;
    drillContext: DrillEventContext;
}

// Intersection element
// Can be a measure, attribute or attribute value. Attribute values have only uri.
export interface IDrillEventIntersectionElement {
    id: string;
    title: string;
    header?: {
        uri: string;
        identifier: string;
    };
}
