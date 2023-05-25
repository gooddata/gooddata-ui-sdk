// (C) 2007-2022 GoodData Corporation
import React from "react";
import { CorePivotTableAgImpl } from "./CorePivotTable.js";
import {
    bucketAttributes,
    bucketIsEmpty,
    bucketsFind,
    bucketTotals,
    IAttribute,
    IAttributeOrMeasure,
    IBucket,
    IDimension,
    IExecutionDefinition,
    INullableFilter,
    ISortItem,
    ITotal,
    MeasureGroupIdentifier,
    newBucket,
    newTwoDimensional,
} from "@gooddata/sdk-model";
import {
    ICorePivotTableProps,
    IMenu,
    IPivotTableBucketProps,
    IPivotTableConfig,
    IPivotTableProps,
} from "./publicTypes.js";
import omit from "lodash/omit.js";
import {
    IntlTranslationsProvider,
    ITranslationsComponentProps,
    withContexts,
    Subtract,
    BucketNames,
    IntlWrapper,
    useResolveValuesWithPlaceholders,
} from "@gooddata/sdk-ui";
import { IBackendCapabilities, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { invariant } from "ts-invariant";
import { AVAILABLE_TOTALS } from "./impl/base/constants.js";

/**
 * Prepares new execution matching pivot table props.
 *
 * @param props - pivot table props
 * @returns new prepared execution
 */
function prepareExecution(props: IPivotTableProps): IPreparedExecution {
    const { backend, workspace, filters, sortBy = [], execConfig = {} } = props;

    return backend!
        .withTelemetry("PivotTable", props)
        .workspace(workspace!)
        .execution()
        .forBuckets(getBuckets(props), filters as INullableFilter[])
        .withDimensions(pivotDimensions)
        .withSorting(...(sortBy as ISortItem[]))
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

function pivotDimensions(def: IExecutionDefinition): IDimension[] {
    const { buckets } = def;
    const row = bucketsFind(buckets, BucketNames.ATTRIBUTE);
    const columns = bucketsFind(buckets, BucketNames.COLUMNS);
    const measures = bucketsFind(buckets, BucketNames.MEASURES);

    const rowAttributes = row ? bucketAttributes(row) : [];
    const columnAttributes = columns ? bucketAttributes(columns) : [];

    const measuresItemIdentifiers = measures && !bucketIsEmpty(measures) ? [MeasureGroupIdentifier] : [];
    const rowTotals = row ? bucketTotals(row) : [];
    const colTotals = columns ? bucketTotals(columns) : [];

    return newTwoDimensional(
        [...rowAttributes, ...rowTotals],
        [...columnAttributes, ...colTotals, ...measuresItemIdentifiers],
    );
}

type IPivotTableNonBucketProps = Subtract<IPivotTableProps, IPivotTableBucketProps>;

class RenderPivotTable extends React.Component<IPivotTableProps> {
    public render() {
        const { exportTitle, backend, workspace, config = {} } = this.props;

        invariant(
            backend,
            "Backend was not provided for PivotTable. Either pass it as a prop or use BackendContext.",
        );

        invariant(
            workspace,
            "Workspace was not provided for PivotTable. Either pass it as a prop or use WorkspaceContext.",
        );

        const newProps: IPivotTableNonBucketProps = omit<IPivotTableProps, keyof IPivotTableBucketProps>(
            this.props,
            ["measures", "rows", "columns", "totals", "filters", "sortBy"],
        );

        const pivotTableConfig: IPivotTableConfig = {
            ...config,
            menu: pivotTableMenuForCapabilities(backend.capabilities, config?.menu),
        };
        const corePivotProps: Partial<ICorePivotTableProps> = omit(newProps, ["backend", "workspace"]);
        const execution = prepareExecution(this.props);

        return (
            <IntlWrapper locale={this.props.locale}>
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
}

const WrappedPivotTable = withContexts(RenderPivotTable);

/**
 * [PivotTable](https://sdk.gooddata.com/gooddata-ui/docs/pivot_table_component.html)
 * is a component with bucket props measures, rows, columns, totals, sortBy, filters
 *
 * @public
 */
export const PivotTable = (props: IPivotTableProps) => {
    const [measures, columns, rows, totals, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measures, props.columns, props.rows, props.totals, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return <WrappedPivotTable {...props} {...{ measures, columns, rows, totals, filters, sortBy }} />;
};

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
