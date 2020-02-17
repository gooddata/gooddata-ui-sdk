// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, newBucket, SortItem } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { roundChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../chartProps";
import { CoreFunnelChart } from "./CoreFunnelChart";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const funnelChartDefinition: IChartDefinition<IFunnelChartBucketProps, IFunnelChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "filters", "sortBy"],
    bucketsFactory: props => {
        return [
            newBucket(BucketNames.MEASURES, ...props.measures),
            newBucket(BucketNames.VIEW, props.viewBy),
        ];
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
export const FunnelChart = withChart(funnelChartDefinition)(CoreFunnelChart);
