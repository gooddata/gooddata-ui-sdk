// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, newBucket, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES, VIEW } from "../../base/constants/bucketNames";
import { roundChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../chartProps";
import { CoreFunnelChart } from "./CoreFunnelChart";
import { getCoreChartProps, IChartDefinition } from "../_commons/chartDefinition";

//
// Public interface
//

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IFunnelChartBucketProps {
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
export interface IFunnelChartProps extends IBucketChartProps, IFunnelChartBucketProps {}

/**
 * [FunnelChart](http://sdk.gooddata.com/gdc-ui-sdk-doc/docs/next/pie_chart_component.html)
 * is a component with bucket props measures, viewBy, filters
 *
 * @public
 */
export function FunnelChart(props: IFunnelChartProps): JSX.Element {
    return <CoreFunnelChart {...getProps(props)} />;
}

//
// Internals
//

const funnelChartDefinition: IChartDefinition<IFunnelChartBucketProps, IFunnelChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "filters", "sortBy"],
    bucketsFactory: props => {
        return [newBucket(MEASURES, ...props.measures), newBucket(VIEW, props.viewBy)];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("FunnelChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withDimensions(roundChartDimensions);
    },
};

const getProps = getCoreChartProps(funnelChartDefinition);
