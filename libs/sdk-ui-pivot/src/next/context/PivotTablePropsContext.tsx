// (C) 2025 GoodData Corporation
import React, { createContext, useContext, ReactNode } from "react";
import { ICorePivotTableNextProps } from "../types/internal.js";
import { PivotTableNextConfig } from "../types/public.js";
import {
    EMPTY_ATTRIBUTES,
    EMPTY_COLUMN_WIDTHS,
    EMPTY_DRILLS,
    EMPTY_FILTERS,
    EMPTY_METRICS,
    EMPTY_OBJECT,
    EMPTY_SORT_BY,
    EMPTY_TOTALS,
    PAGE_SIZE,
} from "../constants/internal.js";
import { IColumnSizing } from "../types/resizing.js";

const PivotTablePropsContext = createContext<ICorePivotTableNextProps | undefined>(undefined);

/**
 * @internal
 */
export function PivotTablePropsProvider({
    children,
    ...props
}: ICorePivotTableNextProps & { children: ReactNode }) {
    return <PivotTablePropsContext.Provider value={props}>{children}</PivotTablePropsContext.Provider>;
}

type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

type ColumnSizingDefaults = "columnWidths";

type ColumnSizingWithDefaults = WithRequired<IColumnSizing, ColumnSizingDefaults>;

type ConfigDefaults = "measureGroupDimension" | "columnHeadersPosition" | "columnSizing" | "textWrapping";

type ConfigWithDefaults = WithRequired<PivotTableNextConfig, ConfigDefaults> & {
    columnSizing: ColumnSizingWithDefaults;
};

type RootPropsDefaults =
    | "rows"
    | "columns"
    | "measures"
    | "filters"
    | "sortBy"
    | "totals"
    | "pageSize"
    | "drillableItems";

type RootPropsWithDefaults = WithRequired<ICorePivotTableNextProps, RootPropsDefaults>;

type PivotTablePropsWithDefaults = RootPropsWithDefaults & {
    config: ConfigWithDefaults;
};

/**
 * @internal
 */
export function applyPivotTableDefaultProps(props: ICorePivotTableNextProps): PivotTablePropsWithDefaults {
    return {
        ...props,
        rows: props.rows ?? EMPTY_ATTRIBUTES,
        columns: props.columns ?? EMPTY_ATTRIBUTES,
        measures: props.measures ?? EMPTY_METRICS,
        filters: props.filters ?? EMPTY_FILTERS,
        sortBy: props.sortBy ?? EMPTY_SORT_BY,
        totals: props.totals ?? EMPTY_TOTALS,
        pageSize: props.pageSize ?? PAGE_SIZE,
        drillableItems: props.drillableItems ?? EMPTY_DRILLS,
        config: {
            ...props.config,
            measureGroupDimension: props.config?.measureGroupDimension ?? "columns",
            columnHeadersPosition: props.config?.columnHeadersPosition ?? "top",
            columnSizing: {
                ...(props.config?.columnSizing ?? {}),
                columnWidths: props.config?.columnSizing?.columnWidths ?? EMPTY_COLUMN_WIDTHS,
            },
            textWrapping: props.config?.textWrapping ?? EMPTY_OBJECT,
        },
    };
}

/**
 * @internal
 */
export function usePivotTableProps(): PivotTablePropsWithDefaults {
    const context = useContext(PivotTablePropsContext);

    if (context === undefined) {
        throw new Error("usePivotTableProps must be used within a PivotTablePropsContext");
    }

    return applyPivotTableDefaultProps(context);
}
