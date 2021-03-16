// (C) 2021 GoodData Corporation

/**
 * @internal
 */
export interface IFilterLabelProps {
    isAllSelected?: boolean;
    isDate?: boolean;
    selection?: string;
    selectionSize?: number;
    title: string;
    noData?: boolean;
}

/**
 * @internal
 */
export interface IFilterLabelState {
    hasEllipsis: boolean;
}
