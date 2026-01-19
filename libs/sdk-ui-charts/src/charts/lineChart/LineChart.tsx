// (C) 2007-2025 GoodData Corporation

import { type IForecastConfig, type IOutliersConfig } from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type IAttributeOrMeasure,
    type IExecutionDefinition,
    type INullableFilter,
    type ISortItem,
    newBucket,
} from "@gooddata/sdk-model";
import {
    type AttributeOrPlaceholder,
    type AttributesMeasuresOrPlaceholders,
    BucketNames,
    type NullableFiltersOrPlaceholders,
    type SortsOrPlaceholders,
    useResolveValuesWithPlaceholders,
} from "@gooddata/sdk-ui";

import { CoreLineChart } from "./CoreLineChart.js";
import { type IBucketChartProps } from "../../interfaces/index.js";
import { withChart } from "../_base/withChart.js";
import { type IChartDefinition } from "../_commons/chartDefinition.js";
import { stackedChartDimensions } from "../_commons/dimensions.js";

//
// Internals
//

function lineChartDimensions(def: IExecutionDefinition) {
    return stackedChartDimensions(def, BucketNames.TREND, BucketNames.SEGMENT);
}

const lineChartDefinition: IChartDefinition<ILineChartBucketProps, ILineChartProps> = {
    chartName: "LineChart",
    bucketPropsKeys: ["measures", "trendBy", "segmentBy", "filters", "sortBy"],
    bucketsFactory: (props) => {
        return [
            newBucket(BucketNames.MEASURES, ...(props.measures as IAttributeOrMeasure[])),
            newBucket(BucketNames.TREND, props.trendBy as IAttribute),
            newBucket(BucketNames.SEGMENT, props.segmentBy as IAttribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        const sortBy = (props.sortBy as ISortItem[]) ?? [];

        return backend!
            .withTelemetry("LineChart", props)
            .workspace(workspace!)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...sortBy)
            .withDimensions(lineChartDimensions)
            .withExecConfig(execConfig!);
    },
};

//
// Public interface
//

/**
 * @public
 */
export interface ILineChartBucketProps {
    /**
     * Specify one or more measures whose values will be displayed on the line chart.
     *
     * @remarks
     * If you specify two or more measures, values of each measure will have their own line.
     */
    measures: AttributesMeasuresOrPlaceholders;

    /**
     * Specify single attribute whose values will be used to slice the lines along the X axis.
     */
    trendBy?: AttributeOrPlaceholder;

    /**
     * Specify single attribute whose values will be used to segment the measure values.
     *
     * @remarks
     * The line chart will display one line per measure values pertaining to the segmentBy attribute values.
     */
    segmentBy?: AttributeOrPlaceholder;

    /**
     * Specify filters to apply on the data to chart.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Specify how to sort the data to chart.
     */
    sortBy?: SortsOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;
}

/**
 * @public
 */
export interface ILineChartProps extends IBucketChartProps, ILineChartBucketProps {
    /**
     * Enter the forecast configuration to apply to the chart data.
     * @beta
     */
    forecastConfig?: IForecastConfig;

    /**
     * Enter the outliers configuration to apply to the chart data.
     * @beta
     */
    outliersConfig?: IOutliersConfig;
}

const WrappedLineChart = withChart(lineChartDefinition)(CoreLineChart);

/**
 * Line chart shows data as line-connected dots.
 *
 * @remarks
 * Line charts can display either multiple measures as individual lines
 * or a single measure split by one attribute into multiple lines with points intersecting attribute values.
 *
 * See {@link ILineChartProps} to learn how to configure the LineChart and the
 * {@link https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/line_chart | line chart documentation} for more information.
 *
 * @public
 */
export function LineChart(props: ILineChartProps) {
    const [measures, trendBy, segmentBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measures, props.trendBy, props.segmentBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedLineChart
            {...props}
            {...{
                measures,
                trendBy,
                segmentBy,
                filters,
                sortBy,
            }}
        />
    );
}
