// (C) 2025 GoodData Corporation

import { type ReactNode, createContext, useContext } from "react";

import { type IExecutionConfig } from "@gooddata/sdk-model";
import { useDeepMemo } from "@gooddata/sdk-ui/internal";

import {
    ACCESSIBILITY_AUTO_PAGE_SIZE,
    DEFAULT_TOTAL_FUNCTIONS,
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
import { type ICorePivotTableNextProps } from "../types/internal.js";
import { type IMenu } from "../types/menu.js";
import { type PivotTableNextConfig } from "../types/public.js";
import { type IColumnSizing } from "../types/resizing.js";

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

type MenuDefaults =
    | "aggregations"
    | "aggregationsSubMenu"
    | "aggregationsSubMenuForRows"
    | "aggregationTypes";

type MenuWithDefaults = WithRequired<IMenu, MenuDefaults>;

type ConfigDefaults =
    | "measureGroupDimension"
    | "columnHeadersPosition"
    | "columnSizing"
    | "textWrapping"
    | "menu";

type ConfigWithDefaults = WithRequired<PivotTableNextConfig, ConfigDefaults> & {
    columnSizing: ColumnSizingWithDefaults;
    menu: MenuWithDefaults;
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
    execConfig: IExecutionConfig;
};

/**
 * @internal
 */
export function applyPivotTableDefaultProps(props: ICorePivotTableNextProps): PivotTablePropsWithDefaults {
    const accessibilityEnabled = props.config?.enableAccessibility ?? false;
    // Use auto page size when accessibility is enabled and no specific page size is provided
    const defaultPageSize = accessibilityEnabled ? ACCESSIBILITY_AUTO_PAGE_SIZE : PAGE_SIZE;

    return {
        ...props,
        rows: props.rows ?? EMPTY_ATTRIBUTES,
        columns: props.columns ?? EMPTY_ATTRIBUTES,
        measures: props.measures ?? EMPTY_METRICS,
        filters: props.filters ?? EMPTY_FILTERS,
        sortBy: props.sortBy ?? EMPTY_SORT_BY,
        totals: props.totals ?? EMPTY_TOTALS,
        pageSize: props.pageSize ?? defaultPageSize,
        drillableItems: props.drillableItems ?? EMPTY_DRILLS,
        config: {
            ...props.config,
            measureGroupDimension: props.config?.measureGroupDimension ?? "columns",
            columnHeadersPosition: props.config?.columnHeadersPosition ?? "top",
            grandTotalsPosition: props.config?.grandTotalsPosition ?? "pinnedBottom",
            columnSizing: {
                ...(props.config?.columnSizing ?? {}),
                columnWidths: props.config?.columnSizing?.columnWidths ?? EMPTY_COLUMN_WIDTHS,
            },
            textWrapping: props.config?.textWrapping ?? EMPTY_OBJECT,
            menu: {
                ...(props.config?.menu ?? {}),
                aggregations: props.config?.menu?.aggregations ?? false,
                aggregationsSubMenu: props.config?.menu?.aggregationsSubMenu ?? false,
                aggregationsSubMenuForRows: props.config?.menu?.aggregationsSubMenuForRows ?? false,
                aggregationTypes: props.config?.menu?.aggregationTypes ?? DEFAULT_TOTAL_FUNCTIONS,
            },
        },
        execConfig: props.execConfig ?? EMPTY_OBJECT,
    };
}

/**
 * @internal
 */
export function usePivotTableProps(): PivotTablePropsWithDefaults {
    const context = useContext(PivotTablePropsContext);
    const memoizeDeep = useDeepMemo();

    if (context === undefined) {
        throw new Error("usePivotTableProps must be used within a PivotTablePropsContext");
    }

    const baseProps = applyPivotTableDefaultProps(context);

    // Recursively memoize nested properties to maintain stable references
    return {
        ...baseProps,
        rows: memoizeDeep("rows", baseProps.rows),
        columns: memoizeDeep("columns", baseProps.columns),
        measures: memoizeDeep("measures", baseProps.measures),
        filters: memoizeDeep("filters", baseProps.filters),
        sortBy: memoizeDeep("sortBy", baseProps.sortBy),
        totals: memoizeDeep("totals", baseProps.totals),
        drillableItems: memoizeDeep("drillableItems", baseProps.drillableItems),
        execConfig: memoizeDeep("execConfig", baseProps.execConfig),
        config: {
            ...baseProps.config,
            columnSizing: memoizeDeep("config.columnSizing", baseProps.config.columnSizing),
            textWrapping: memoizeDeep("config.textWrapping", baseProps.config.textWrapping),
            menu: memoizeDeep("config.menu", baseProps.config.menu),
        },
    };
}
