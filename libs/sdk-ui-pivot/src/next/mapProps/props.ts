// (C) 2025 GoodData Corporation
import { RowModelType } from "ag-grid-enterprise";
import {
    ColumnHeadersPosition,
    IPivotTableNextProps,
    MeasureGroupDimension,
    PivotTableNextConfig,
} from "../types/public.js";
import {
    EMPTY_CONFIG,
    EMPTY_ATTRIBUTES,
    EMPTY_METRICS,
    EMPTY_FILTERS,
    EMPTY_SORT_BY,
} from "../constants/internal.js";
import { IAttribute, IFilter, IMeasure, ISortItem } from "@gooddata/sdk-model";

export function getConfig(props: IPivotTableNextProps): PivotTableNextConfig {
    const { config = EMPTY_CONFIG } = props;
    return config;
}

/**
 * @internal
 */
export function getMeasureGroupDimension(props: IPivotTableNextProps): MeasureGroupDimension {
    const config = getConfig(props);
    return config.measureGroupDimension ?? "columns";
}

/**
 * @internal
 */
export function getColumnHeadersPosition(props: IPivotTableNextProps): ColumnHeadersPosition {
    const config = getConfig(props);
    return config.columnHeadersPosition ?? "top";
}

/**
 * @internal
 */
export function getPreloadAllData(props: IPivotTableNextProps): boolean {
    const config = getConfig(props);
    return config.preloadAllData ?? false;
}

/**
 * @internal
 */
export function getIsPivotMode(props: IPivotTableNextProps): boolean {
    const { columns = EMPTY_ATTRIBUTES } = props;
    return columns.length > 0;
}

/**
 * @internal
 */
export function getColumns(props: IPivotTableNextProps): IAttribute[] {
    const { columns = EMPTY_ATTRIBUTES } = props;
    return columns;
}

/**
 * @internal
 */
export function getRows(props: IPivotTableNextProps): IAttribute[] {
    const { rows = EMPTY_ATTRIBUTES } = props;
    return rows;
}

/**
 * @internal
 */
export function getMeasures(props: IPivotTableNextProps): IMeasure[] {
    const { measures = EMPTY_METRICS } = props;
    return measures;
}

/**
 * @internal
 */
export function getFilters(props: IPivotTableNextProps): IFilter[] {
    const { filters = EMPTY_FILTERS } = props;
    return filters;
}

/**
 * @internal
 */
export function getSortBy(props: IPivotTableNextProps): ISortItem[] {
    const { sortBy = EMPTY_SORT_BY } = props;
    return sortBy;
}

/**
 * @internal
 */
export function getExecutionProps(props: IPivotTableNextProps) {
    const columns = getColumns(props);
    const rows = getRows(props);
    const measures = getMeasures(props);
    const filters = getFilters(props);
    const sortBy = getSortBy(props);

    return { columns, rows, measures, filters, sortBy };
}

//
// Ag-Grid Related Props
//
export function getRowModelType(props: IPivotTableNextProps): RowModelType {
    const preloadAllData = getPreloadAllData(props);
    return preloadAllData ? "clientSide" : "serverSide";
}
