// (C) 2019 GoodData Corporation
import {
    AttributeOrMeasure,
    applyRatioRule,
    IAttribute,
    IFilter,
    newBucket,
    SortItem,
} from "@gooddata/sdk-model";
import { ATTRIBUTE, MEASURES, STACK } from "../../base/constants/bucketNames";
import { ViewByAttributesLimit } from "../_commons/limits";
import { IBucketChartProps } from "../chartProps";
import { truncate } from "../_commons/truncate";
import { sanitizeConfig } from "../../highcharts";
import { CoreBarChart } from "./CoreBarChart";
import { stackedChartDimensions } from "../_commons/dimensions";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const barChartDefinition: IChartDefinition<IBarChartBucketProps, IBarChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "stackBy", "filters", "sortBy"],
    bucketsFactory: props => {
        const measures = applyRatioRule(props.measures);
        const viewBy = truncate(props.viewBy, ViewByAttributesLimit);

        return [
            newBucket(MEASURES, ...measures),
            newBucket(ATTRIBUTE, ...viewBy),
            newBucket(STACK, props.stackBy),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("BarChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withSorting(...props.sortBy)
            .withDimensions(stackedChartDimensions);
    },
    propOverridesFactory: (props, buckets) => {
        return {
            config: sanitizeConfig(buckets, props.config),
        };
    },
};

//
// Public interface
//

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IBarChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute | IAttribute[];
    stackBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IBarChartProps extends IBarChartBucketProps, IBucketChartProps {}

/**
 * TODO: SDK8: add docs
 * @public
 */
export const BarChart = withChart(barChartDefinition)(CoreBarChart);
