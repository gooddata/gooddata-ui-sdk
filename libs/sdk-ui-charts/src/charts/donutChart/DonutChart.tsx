// (C) 2007-2026 GoodData Corporation

import {
    type IAttribute,
    type IAttributeOrMeasure,
    type INullableFilter,
    type ISortItem,
    newBucket,
} from "@gooddata/sdk-model";
import {
    type AttributeMeasureOrPlaceholder,
    type AttributeOrPlaceholder,
    type AttributesMeasuresOrPlaceholders,
    BucketNames,
    type NullableFiltersOrPlaceholders,
    type SortsOrPlaceholders,
    useResolveValuesWithPlaceholders,
} from "@gooddata/sdk-ui";

import { CoreDonutChart } from "./CoreDonutChart.js";
import { type IBucketChartProps } from "../../interfaces/chartProps.js";
import { withChart } from "../_base/withChart.js";
import { type IChartDefinition } from "../_commons/chartDefinition.js";
import { roundChartDimensions } from "../_commons/dimensions.js";

//
// Internals
//

const donutChartDefinition: IChartDefinition<IDonutChartBucketProps, IDonutChartProps> = {
    chartName: "DonutChart",
    bucketPropsKeys: ["measures", "viewBy", "filters", "sortBy"],
    bucketsFactory: (props) => {
        const measures = (
            Array.isArray(props.measures) ? props.measures : [props.measures]
        ) as IAttributeOrMeasure[];

        return [
            newBucket(BucketNames.MEASURES, ...measures),
            newBucket(BucketNames.VIEW, props.viewBy as IAttribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        const sortBy = (props.sortBy as ISortItem[]) ?? [];

        return backend!
            .withTelemetry("DonutChart", props)
            .workspace(workspace!)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...sortBy)
            .withDimensions(roundChartDimensions)
            .withExecConfig(execConfig!);
    },
};

//
// Public interface
//

/**
 * @public
 */
export interface IDonutChartBucketProps {
    /**
     * Specify one or more measures to segment the donut chart.
     *
     * @remarks
     * If you specify a single measure, then you may further specify the viewBy attribute - there will be
     * donut slice per attribute value.
     *
     * If you specify multiple measures, then there will be a donut slice for each measure value. You may not
     * specify the viewBy in this case.
     */
    measures: AttributeMeasureOrPlaceholder | AttributesMeasuresOrPlaceholders;

    /**
     * Specify viewBy attribute that will be used to create the donut slices. There will be a slice
     * for each value of the attribute.
     */
    viewBy?: AttributeOrPlaceholder;

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
export interface IDonutChartProps extends IBucketChartProps, IDonutChartBucketProps {}

const WrappedDonutChart = withChart(donutChartDefinition)(CoreDonutChart);

/**
 * Donut chart shows data as proportional segments of a disc and has a hollowed out center.
 *
 * @remarks
 * Donut charts can be segmented by either multiple measures or an attribute, and allow viewers to visualize
 * component parts of a whole.
 *
 * Note: the donut chart slices are by default sorted from largest to smallest. There is also a limit on the
 * number of slices that will be charted.
 *
 * See {@link IDonutChartProps} to learn how to configure the DonutChart and
 * {@link https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/donut_chart | donut chart documentation} for more information.
 *
 * @public
 */
export function DonutChart(props: IDonutChartProps) {
    const [measures, viewBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measures, props.viewBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedDonutChart
            {...props}
            {...{
                measures,
                viewBy,
                filters,
                sortBy,
            }}
        />
    );
}
