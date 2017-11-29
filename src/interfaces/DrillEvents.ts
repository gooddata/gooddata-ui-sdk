import { AFM } from '@gooddata/typings';
import { VisType, VisElementType } from '../constants/visualizationTypes';

export interface IDrillEvent {
    executionContext: AFM.IAfm;
    drillContext: {
        type: VisType;
        element: VisElementType;
        x?: number;
        y?: number;
        columnIndex?: number;
        rowIndex?: number;
        row?: any[];
        intersection: IDrillEventIntersectionElement[];
        points: IDrillEventPoint[];
    };
}

export interface IDrillEventPoint {
    x: number;
    y: number;
    intersection: IDrillEventIntersectionElement[];
}

export interface IDrillEventIntersectionElement {
    id: string;
    title: string;
    header: {
        uri: string;
        identifier: string;
    };
}

export interface IDrillableItem {
    uri?: string;
    identifier?: string;
}
