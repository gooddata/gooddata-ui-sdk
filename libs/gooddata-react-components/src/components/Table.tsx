// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import omit = require("lodash/omit");
import { VisualizationObject, VisualizationInput } from "@gooddata/typings";

import { Subtract } from "../typings/subtract";
import { Table as AfmTable } from "./afm/Table";
import { ICommonChartProps } from "./core/base/BaseChart";
import { convertBucketsToAFM } from "../helpers/conversion";
import { getTableDimensions } from "../helpers/dimensions";
import { getResultSpec } from "../helpers/resultSpec";
import { MEASURES, ATTRIBUTE } from "../constants/bucketNames";

export interface ITableBucketProps {
    measures?: VisualizationInput.AttributeOrMeasure[];
    attributes?: VisualizationInput.IAttribute[];
    totals?: VisualizationInput.ITotal[];
    filters?: VisualizationInput.IFilter[];
    sortBy?: VisualizationInput.ISort[];
}

export interface ITableProps extends ICommonChartProps, ITableBucketProps {
    projectId: string;
    totalsEditAllowed?: boolean;
}

type ITableNonBucketProps = Subtract<ITableProps, ITableBucketProps>;

/**
 * [Table](http://sdk.gooddata.com/gooddata-ui/docs/table_component.html)
 * is a component with bucket props measures, attributes, totals, filters
 */
export function Table(props: ITableProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: props.measures || [],
        },
        {
            localIdentifier: ATTRIBUTE,
            items: props.attributes || [],
            totals: props.totals || [],
        },
    ];

    const newProps: ITableNonBucketProps = omit<ITableProps, keyof ITableBucketProps>(props, [
        "measures",
        "attributes",
        "totals",
        "filters",
        "sortBy",
    ]);

    return (
        <AfmTable
            {...newProps}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getResultSpec(buckets, props.sortBy, getTableDimensions)}
        />
    );
}
