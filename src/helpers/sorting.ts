import { Transformation } from '@gooddata/data-layer';

export const DESC = 'desc';
export const ASC = 'asc';

export const COLUMN_TYPE_METRIC = 'metric';
export const COLUMN_TYPE_ATTRIBUTE = 'attrLabel';

export interface ISortingChange {
    id: string;
    title: string;
    type: string;
    uri: string;
}

function getColumn(change: ISortingChange): string {
    return change.type === COLUMN_TYPE_METRIC ? change.id : change.uri;
}

function toggleSorting(currentSorting: string) {
    return currentSorting === ASC ? DESC : ASC;
}

function getDirection(change: ISortingChange, prevSorting: Transformation.ISort) {
    const defaultSortingDirection = change.type === COLUMN_TYPE_METRIC ? DESC : ASC;

    if (!prevSorting || prevSorting.column !== getColumn(change)) {
        return defaultSortingDirection;
    }

    return toggleSorting(prevSorting.direction);
}

export function getSorting(change: ISortingChange, prevSorting: Transformation.ISort): Transformation.ISort {
    return {
        column: getColumn(change),
        direction: getDirection(change, prevSorting)
    };
}
