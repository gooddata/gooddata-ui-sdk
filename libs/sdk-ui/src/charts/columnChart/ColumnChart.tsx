// (C) 2007-2019 GoodData Corporation
import {
    AttributeOrMeasure,
    applyRatioRule,
    IAttribute,
    IFilter,
    newBucket,
    SortItem,
} from "@gooddata/sdk-model";
import { ViewByAttributesLimit } from "../_commons/limits";
import { truncate } from "../_commons/truncate";
import { ATTRIBUTE, MEASURES, STACK } from "../../base/constants/bucketNames";
import { sanitizeConfig } from "../../highcharts";
import { stackedChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../chartProps";
import { CoreColumnChart } from "./CoreColumnChart";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const columnChartDefinition: IChartDefinition<IColumnChartBucketProps, IColumnChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "stackBy", "filters", "sortBy"],
    bucketsFactory: props => {
        const measures = applyRatioRule(props.measures);
        const viewBy = truncate(props.viewBy, ViewByAttributesLimit); // could be one or two attributes

        return [
            newBucket(MEASURES, ...measures),
            newBucket(ATTRIBUTE, ...viewBy),
            newBucket(STACK, props.stackBy),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("ColumnChart", props)
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
 *
 * @public
 */
export interface IColumnChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute | IAttribute[];
    stackBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IColumnChartProps extends IBucketChartProps, IColumnChartBucketProps {}

/**
 * [ColumnChart](http://sdk.gooddata.com/gooddata-ui/docs/column_chart_component.html)
 * is a component with bucket props measures, viewBy, stackBy, filters
 *
 * @public
 */
export const ColumnChart = withChart(columnChartDefinition)(CoreColumnChart);
