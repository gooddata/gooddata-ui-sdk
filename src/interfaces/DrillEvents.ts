// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from '@gooddata/typings';
import { VisType, VisElementType } from '../constants/visualizationTypes';

// IDrillEvent is a parameter of the onFiredDrillEvent is callback
export interface IDrillEvent {
    executionContext: AFM.IAfm;
    drillContext: {
        type: VisType; // type of visualization
        element: VisElementType; // type of visualization element drilled
        x?: number; // chart x coordinate (if supported)
        y?: number; // chart y coordinate (if supported)
        columnIndex?: number;
        rowIndex?: number;
        row?: any[]; // table row data of the drilled row
        value?: string; // cell or element value drilled
        // some drill headers that are relevant for current drill element
        intersection: IDrillEventIntersectionElement[];
        // A collection of chart series points (if available)
        points?: IDrillEventPoint[];
    };
}

// Chart series point with intersection element
export interface IDrillEventPoint {
    x: number;
    y: number;
    intersection: IDrillEventIntersectionElement[];
}

// Intersection element
// Can be a measure, attribute or attribute value. Attribute values have only uri.
export interface IDrillEventIntersectionElement {
    id: string;
    title: string;
    header: {
        uri: string;
        identifier: string;
    };
}

// Internal precursor to IDrillEventIntersectionElement
// TODO: Refactor internal drilling functions and replace with IDrillEventIntersectionElement
export interface IDrillableItem {
    uri?: string;
    identifier?: string;
    title?: string;
}

export type IDrillEventCallback = (event: IDrillEvent) => void | boolean;

// Consider refactoring and removing this as a separate type
export interface IDrillableItemLocalId extends IDrillableItem {
    localIdentifier: AFM.Identifier;
}

export type IDrillItem = IDrillableItem | IDrillableItemLocalId;

// Internal precursor to IDrillEventIntersectionElement
// TODO: Refactor internal drilling functions and replace with IDrillEventIntersectionElement
export interface IDrillIntersection {
    id: string;
    title?: string;
    value?: Execution.DataValue;
    name?: string;
    uri: string;
    identifier: AFM.Identifier;
}

export function isDrillableItemLocalId(item: IDrillItem): item is IDrillableItemLocalId {
    return (item as IDrillableItemLocalId).localIdentifier !== undefined;
}
