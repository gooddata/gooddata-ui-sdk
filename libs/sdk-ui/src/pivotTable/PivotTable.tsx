// (C) 2007-2018 GoodData Corporation
import * as React from "react";

import { Subtract } from "../base/typings/subtract";
import { CorePivotTable } from "./CorePivotTable";
import { ATTRIBUTE, COLUMNS, MEASURES } from "../base/constants/bucketNames";
import {
    attributeId,
    bucketAttributes,
    bucketIsEmpty,
    bucketsFind,
    bucketTotals,
    IBucket,
    IDimension,
    IExecutionDefinition,
    MeasureGroupIdentifier,
    newBucket,
} from "@gooddata/sdk-model";
import { IPivotTableBucketProps, IPivotTableProps } from "./types";
import omit = require("lodash/omit");
import { IntlWrapper } from "../base/translations/IntlWrapper";
import {
    IntlTranslationsProvider,
    ITranslationsComponentProps,
} from "../base/translations/TranslationsProvider";
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";

type IPivotTableNonBucketProps = Subtract<IPivotTableProps, IPivotTableBucketProps>;
/**
 * Update link to documentation [PivotTable](https://sdk.gooddata.com/gooddata-ui/docs/next/pivot_table_component.html)
 * is a component with bucket props measures, rows, columns, totals, sortBy, filters
 */
export class PivotTable extends React.Component<IPivotTableProps> {
    public static defaultProps: Partial<IPivotTableProps> = {
        groupRows: true,
    };

    public render() {
        const { exportTitle } = this.props;

        const newProps: IPivotTableNonBucketProps = omit<IPivotTableProps, keyof IPivotTableBucketProps>(
            this.props,
            ["measures", "rows", "columns", "totals", "filters", "sortBy"],
        );

        const execution = prepareExecution(this.props);

        return (
            <IntlWrapper locale={this.props.locale}>
                <IntlTranslationsProvider>
                    {(translationProps: ITranslationsComponentProps) => {
                        return (
                            <CorePivotTable
                                {...newProps}
                                intl={translationProps.intl}
                                execution={execution}
                                exportTitle={exportTitle}
                            />
                        );
                    }}
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    }
}

/**
 * Prepares new execution matching pivot table props.
 *
 * @param props - pivot table props
 * @returns new prepared execution
 * @internal
 */
export function prepareExecution(props: IPivotTableProps): IPreparedExecution {
    const { backend, workspace, filters, sortBy } = props;

    return backend
        .workspace(workspace)
        .execution()
        .forBuckets(getBuckets(props), filters)
        .withDimensions(pivotDimensions)
        .withSorting(...sortBy);
}

function getBuckets(props: IPivotTableBucketProps): IBucket[] {
    const { measures = [], rows = [], columns = [], totals = [] } = props;

    return [
        newBucket(MEASURES, ...measures),
        // ATTRIBUTE for backwards compatibility with Table component. Actually ROWS
        newBucket(ATTRIBUTE, ...rows, ...totals),
        newBucket(COLUMNS, ...columns),
    ];
}

function pivotDimensions(def: IExecutionDefinition): IDimension[] {
    const { buckets } = def;
    const row = bucketsFind(buckets, ATTRIBUTE);
    const columns = bucketsFind(buckets, COLUMNS);
    const measures = bucketsFind(buckets, MEASURES);

    const rowAttributeIds = bucketAttributes(row).map(attributeId);
    const columnAttributeIds = bucketAttributes(columns).map(attributeId);

    const measuresItemIdentifiers = !bucketIsEmpty(measures) ? [MeasureGroupIdentifier] : [];

    const totals = bucketTotals(row);
    const totalsProp = totals.length ? { totals } : {};

    return [
        {
            itemIdentifiers: rowAttributeIds,
            ...totalsProp,
        },
        {
            itemIdentifiers: [...columnAttributeIds, ...measuresItemIdentifiers],
        },
    ];
}
