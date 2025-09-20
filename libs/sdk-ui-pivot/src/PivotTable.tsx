// (C) 2007-2025 GoodData Corporation

import { omit } from "lodash-es";
import { invariant } from "ts-invariant";

import { IBackendCapabilities, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    IAttribute,
    IAttributeOrMeasure,
    IBucket,
    IDimension,
    IExecutionDefinition,
    INullableFilter,
    ISortItem,
    ITotal,
    MeasureGroupIdentifier,
    bucketAttributes,
    bucketIsEmpty,
    bucketTotals,
    bucketsFind,
    isMeasureSort,
    newBucket,
    newTwoDimensional,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    ITranslationsComponentProps,
    IntlTranslationsProvider,
    IntlWrapper,
    Subtract,
    useResolveValuesWithPlaceholders,
    withContexts,
} from "@gooddata/sdk-ui";

import { CorePivotTableAgImpl } from "./CorePivotTable.js";
import { AVAILABLE_TOTALS } from "./impl/base/constants.js";
import {
    ICorePivotTableProps,
    IMenu,
    IPivotTableBucketProps,
    IPivotTableConfig,
    IPivotTableProps,
} from "./publicTypes.js";

/**
 * Prepares new execution matching pivot table props.
 *
 * @param props - pivot table props
 * @returns new prepared execution
 */
function prepareExecution(props: IPivotTableProps): IPreparedExecution {
    const { backend, workspace, filters, sortBy = [], execConfig = {}, config = {} } = props;

    const sanitizedSortBy = getSanitizedPivotTableSortBy(sortBy as ISortItem[], isTransposed(config));

    return backend!
        .withTelemetry("PivotTable", props)
        .workspace(workspace!)
        .execution()
        .forBuckets(getBuckets(props), filters as INullableFilter[])
        .withDimensions((def: IExecutionDefinition) =>
            getPivotTableDimensions(def.buckets, isTransposed(config)),
        )
        .withSorting(...(sanitizedSortBy as ISortItem[]))
        .withExecConfig(execConfig);
}

function getBuckets(props: IPivotTableBucketProps): IBucket[] {
    const {
        measures = [],
        rows = [],
        columns = [],
        totals = [],
    } = props as {
        measures: IAttributeOrMeasure[];
        rows: IAttribute[];
        columns: IAttribute[];
        totals: ITotal[];
    };

    const rowTotals = totals.filter((total) =>
        rows.find((attr) => attr.attribute.localIdentifier === total.attributeIdentifier),
    );
    const colTotals = totals.filter((total) =>
        columns.find((attr) => attr.attribute.localIdentifier === total.attributeIdentifier),
    );

    return [
        newBucket(BucketNames.MEASURES, ...measures),
        // ATTRIBUTE for backwards compatibility with Table component. Actually ROWS
        newBucket(BucketNames.ATTRIBUTE, ...rows, ...rowTotals),
        newBucket(BucketNames.COLUMNS, ...columns, ...colTotals),
    ];
}

function isTransposed(config: IPivotTableConfig) {
    const measureGroupDimension = config.measureGroupDimension ?? "columns";
    return measureGroupDimension === "rows";
}

type IPivotTableNonBucketProps = Subtract<IPivotTableProps, IPivotTableBucketProps>;

const validateConfig = (props: IPivotTableProps): IPivotTableConfig => {
    const { rows, columns, config = {} } = props;
    if (config.columnHeadersPosition === "left") {
        const hasColumns = columns && columns.length > 0;
        if (!rows && hasColumns && config.measureGroupDimension === "rows") {
            return config;
        } else {
            console.warn(
                "Invalid table configuration. `columnHeadersPosition: left` requires metrics in rows, no row attributes and at least one column attribute defined.",
            );
            return {
                ...config,
                columnHeadersPosition: "top",
            };
        }
    }
    return config;
};

function RenderPivotTable(props: IPivotTableProps) {
    const { exportTitle, backend, workspace, config = {} } = props;

    invariant(
        backend,
        "Backend was not provided for PivotTable. Either pass it as a prop or use BackendContext.",
    );

    invariant(
        workspace,
        "Workspace was not provided for PivotTable. Either pass it as a prop or use WorkspaceContext.",
    );

    const newProps: IPivotTableNonBucketProps = omit<IPivotTableProps, keyof IPivotTableBucketProps>(props, [
        "measures",
        "rows",
        "columns",
        "totals",
        "filters",
        "sortBy",
    ]);

    const pivotTableConfig: IPivotTableConfig = {
        ...validateConfig(props),
        menu: pivotTableMenuForCapabilities(backend.capabilities, config?.menu),
    };
    const corePivotProps: Partial<ICorePivotTableProps> = omit(newProps, ["backend", "workspace"]);
    const execution = prepareExecution(props);

    return (
        <IntlWrapper locale={props.locale}>
            <IntlTranslationsProvider>
                {(translationProps: ITranslationsComponentProps) => {
                    return (
                        <CorePivotTableAgImpl
                            {...corePivotProps}
                            config={pivotTableConfig}
                            intl={translationProps.intl}
                            execution={execution}
                            exportTitle={exportTitle || "PivotTable"}
                        />
                    );
                }}
            </IntlTranslationsProvider>
        </IntlWrapper>
    );
}

const WrappedPivotTable = withContexts(RenderPivotTable);

/**
 * [PivotTable](https://sdk.gooddata.com/gooddata-ui/docs/pivot_table_component.html)
 * is a component with bucket props measures, rows, columns, totals, sortBy, filters
 *
 * @public
 */
export function PivotTable(props: IPivotTableProps) {
    const [measures, columns, rows, totals, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measures, props.columns, props.rows, props.totals, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return <WrappedPivotTable {...props} {...{ measures, columns, rows, totals, filters, sortBy }} />;
}

/**
 * Given analytical backend capabilities and the desired aggregations menu config.
 *
 * @remarks
 * This function will correct the menu configuration so that it fits the capabilities.
 *
 * The function will explicitly set the options regardless of what is the (current) default value of the option if
 * it is not present in the menu. The backend capabilities are a hard stop for features.
 *
 * Note: the {@link PivotTable} will use this function out of the box to ensure the effective menu configuration
 * matches the backend capabilities. You don't need to use when creating a PivotTable.
 *
 * @param capabilities - Backend capabilities
 * @param desiredMenu - Aggregation menu configuration desired by the client
 * @public
 */
export function pivotTableMenuForCapabilities(
    capabilities: IBackendCapabilities,
    desiredMenu: IMenu = {},
): IMenu {
    const effectiveMenu = { ...desiredMenu };

    if (!capabilities.canCalculateGrandTotals) {
        return {
            aggregations: false,
        };
    }

    if (!capabilities.canCalculateNativeTotals) {
        effectiveMenu.aggregationTypes = (effectiveMenu.aggregationTypes ?? AVAILABLE_TOTALS).filter(
            (totalType) => totalType !== "nat",
        );
    }

    if (effectiveMenu.aggregationTypes?.length === 0) {
        return {
            aggregations: false,
        };
    }

    return effectiveMenu;
}

/**
 * Prepares dimensions for pivot table execution from buckets and info if table is transposed or not.
 *
 * @param buckets - table buckets
 * @param isTransposed - whether table is transposed (metrics are in rows)
 * @public
 */
export function getPivotTableDimensions(buckets: IBucket[], isTransposed: boolean): IDimension[] {
    const row = bucketsFind(buckets, BucketNames.ATTRIBUTE);
    const columns = bucketsFind(buckets, BucketNames.COLUMNS);
    const measures = bucketsFind(buckets, BucketNames.MEASURES);

    const rowAttributes = row ? bucketAttributes(row) : [];
    const columnAttributes = columns ? bucketAttributes(columns) : [];

    const measuresItemIdentifiers = measures && !bucketIsEmpty(measures) ? [MeasureGroupIdentifier] : [];
    const rowTotals = row ? bucketTotals(row) : [];
    const colTotals = columns ? bucketTotals(columns) : [];

    const rowMeasureItemIdentifiers = isTransposed ? measuresItemIdentifiers : [];
    const columnMeasureItemIdentifiers = isTransposed ? [] : measuresItemIdentifiers;

    return newTwoDimensional(
        [...rowAttributes, ...rowMeasureItemIdentifiers, ...rowTotals],
        [...columnAttributes, ...colTotals, ...columnMeasureItemIdentifiers],
    );
}

function getSanitizedPivotTableSortBy(sortBy: ISortItem[], isTransposed: boolean) {
    // Measure sort is not supported on transposed table (metrics in rows).
    if (isTransposed) {
        return sortBy.filter((item) => !isMeasureSort(item));
    }

    return sortBy;
}
