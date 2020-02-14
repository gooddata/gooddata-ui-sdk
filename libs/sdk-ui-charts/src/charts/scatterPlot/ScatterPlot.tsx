// (C) 2007-2018 GoodData Corporation
import { IAttribute, IFilter, IMeasure, newBucket, SortItem } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { pointyChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../chartProps";
import { CoreScatterPlot } from "./CoreScatterPlot";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const scatterPlotDefinition: IChartDefinition<IScatterPlotBucketProps, IScatterPlotProps> = {
    bucketPropsKeys: ["xAxisMeasure", "yAxisMeasure", "attribute", "filters", "sortBy"],
    bucketsFactory: props => {
        return [
            newBucket(BucketNames.MEASURES, props.xAxisMeasure),
            newBucket(BucketNames.SECONDARY_MEASURES, props.yAxisMeasure),
            newBucket(BucketNames.ATTRIBUTE, props.attribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("ScatterPlot", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withDimensions(pointyChartDimensions);
    },
};

//
// Public interface
//

/**
 * TODO: SDK8
 *
 * @public
 */
export interface IScatterPlotBucketProps {
    xAxisMeasure?: IMeasure;
    yAxisMeasure?: IMeasure;
    attribute?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[]; // TODO would it be removed? if not dont forget to test
}

/**
 * TODO: SDK8
 *
 * @public
 */
export interface IScatterPlotProps extends IBucketChartProps, IScatterPlotBucketProps {}

/**
 * [ScatterPlot](http://sdk.gooddata.com/gooddata-ui/docs/scatter_plot_component.html)
 * is a component with bucket props xAxisMeasure, yAxisMeasure, attribute, filters
 *
 * @public
 */
export const ScatterPlot = withChart(scatterPlotDefinition)(CoreScatterPlot);
