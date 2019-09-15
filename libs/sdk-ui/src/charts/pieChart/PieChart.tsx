// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, SortItem, newBucket } from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES, VIEW } from "../../base/constants/bucketNames";
import { roundChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../chartProps";
import { CorePieChart } from "./CorePieChart";
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition";

//
// Public interface
//

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IPieChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IPieChartProps extends IBucketChartProps, IPieChartBucketProps {}

/**
 * [PieChart](http://sdk.gooddata.com/gooddata-ui/docs/pie_chart_component.html)
 * is a component with bucket props measures, viewBy, filters
 *
 * @public
 */
export function PieChart(props: IPieChartProps): JSX.Element {
    return <CorePieChart {...getProps(props)} />;
}

//
// Internals
//

const pieChartDefinition: IChartDefinition<IPieChartBucketProps, IPieChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "filters", "sortBy"],
    bucketsFactory: props => {
        return [newBucket(MEASURES, ...props.measures), newBucket(VIEW, props.viewBy)];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("PieChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withDimensions(roundChartDimensions);
    },
};

const getProps = getCoreChartProps(pieChartDefinition);
