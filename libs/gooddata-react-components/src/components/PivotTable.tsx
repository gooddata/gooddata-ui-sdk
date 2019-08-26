// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { VisualizationObject, VisualizationInput } from "@gooddata/typings";
import omit = require("lodash/omit");
import noop = require("lodash/noop");

import { Subtract } from "../typings/subtract";
import { PivotTable as CorePivotTable } from "./core/PivotTable";
import { dataSourceProvider } from "./afm/DataSourceProvider";
import { ICommonChartProps } from "./core/base/BaseChart";
import { convertBucketsToAFM } from "../helpers/conversion";
import { getPivotTableDimensions } from "../helpers/dimensions";
import { getResultSpec } from "../helpers/resultSpec";
import { IPivotTableConfig } from "../interfaces/PivotTable";

import { MEASURES, ATTRIBUTE, COLUMNS } from "../constants/bucketNames";
import { hasDuplicateIdentifiers } from "../helpers/errorHandlers";

export interface IPivotTableBucketProps {
    measures?: VisualizationInput.AttributeOrMeasure[];
    rows?: VisualizationInput.IAttribute[];
    columns?: VisualizationInput.IAttribute[];
    totals?: VisualizationInput.ITotal[];
    filters?: VisualizationInput.IFilter[];
    sortBy?: VisualizationInput.ISort[];
}

export interface IPivotTableProps extends ICommonChartProps, IPivotTableBucketProps {
    projectId: string;
    pageSize?: number;
    config?: IPivotTableConfig;
    groupRows?: boolean;
    exportTitle?: string;
}

export const getBuckets = (props: IPivotTableBucketProps): VisualizationObject.IBucket[] => {
    const { measures, rows, columns, totals } = props;

    return [
        {
            localIdentifier: MEASURES,
            items: measures || [],
        },
        {
            // ATTRIBUTE for backwards compatibility with Table component. Actually ROWS
            localIdentifier: ATTRIBUTE,
            items: rows || [],
            totals: totals || [],
        },
        {
            localIdentifier: COLUMNS,
            items: columns || [],
        },
    ];
};

// noop is never called because resultSpec is always provided
const DataSourceProvider = dataSourceProvider(CorePivotTable, noop as any, "PivotTable");

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
        const { sortBy, filters, exportTitle } = this.props;

        const buckets: VisualizationObject.IBucket[] = getBuckets(this.props);

        const afm = convertBucketsToAFM(buckets, filters);

        const resultSpec = getResultSpec(buckets, sortBy, getPivotTableDimensions);

        hasDuplicateIdentifiers(buckets);

        // PivotTable component still has 'rows' prop even though this is translated into ATTRIBUTE bucket
        const newProps: IPivotTableNonBucketProps = omit<IPivotTableProps, keyof IPivotTableBucketProps>(
            this.props,
            ["measures", "rows", "columns", "totals", "filters", "sortBy"],
        );

        return (
            <DataSourceProvider {...newProps} afm={afm} resultSpec={resultSpec} exportTitle={exportTitle} />
        );
    }
}
