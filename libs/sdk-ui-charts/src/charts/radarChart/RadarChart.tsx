// (C) 2026 GoodData Corporation

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

import { type IBucketChartProps } from "../../interfaces/chartProps.js";
import { withChart } from "../_base/withChart.js";
import { type IChartDefinition } from "../_commons/chartDefinition.js";
import { stackedChartDimensions } from "../_commons/dimensions.js";

import { CoreRadarChart } from "./CoreRadarChart.js";

//
// Internals
//

function radarChartDimensions(def: IExecutionDefinition) {
    return stackedChartDimensions(def, BucketNames.TREND, BucketNames.SEGMENT);
}

const radarChartDefinition: IChartDefinition<IRadarChartBucketProps, IRadarChartProps> = {
    chartName: "RadarChart",
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
            .withTelemetry("RadarChart", props)
            .workspace(workspace!)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...sortBy)
            .withDimensions(radarChartDimensions)
            .withExecConfig(execConfig!);
    },
};

//
// Public interface
//

/**
 * @alpha
 */
export interface IRadarChartBucketProps {
    /**
     * Specify one or more measures whose values will be displayed on the radar chart.
     *
     * @remarks
     * If you specify two or more measures, values of each measure will be displayed as separate polygons.
     */
    measures: AttributesMeasuresOrPlaceholders;

    /**
     * Specify single attribute whose values will be used to create the radar spokes (axes).
     *
     * @remarks
     * Each attribute value becomes a spoke radiating from the center of the radar chart.
     */
    trendBy?: AttributeOrPlaceholder;

    /**
     * Specify single attribute whose values will be used to segment the measure values.
     *
     * @remarks
     * The radar chart will display one polygon per measure values pertaining to the segmentBy attribute values.
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
 * @alpha
 */
export interface IRadarChartProps extends IBucketChartProps, IRadarChartBucketProps {}

const WrappedRadarChart = withChart(radarChartDefinition)(CoreRadarChart);

/**
 * Radar chart (also known as spider chart or web chart) displays data on radial axes starting from a common center point.
 *
 * @remarks
 * Radar charts can display either multiple measures as individual polygons
 * or a single measure split by one attribute into multiple polygons with points intersecting attribute values.
 *
 * See {@link IRadarChartProps} to learn how to configure the RadarChart and the
 * {@link https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/radar_chart | radar chart documentation} for more information.
 *
 * @alpha
 */
export function RadarChart(props: IRadarChartProps) {
    const [measures, trendBy, segmentBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measures, props.trendBy, props.segmentBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedRadarChart
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
