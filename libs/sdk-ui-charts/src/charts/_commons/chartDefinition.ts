// (C) 2019-2020 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IBucket } from "@gooddata/sdk-model";
import omit from "lodash/omit.js";

import { ICoreChartProps, IBucketChartProps } from "../../interfaces/index.js";

/**
 * Specifies props that are on bucket chart props but not on core chart props - these must not be passed
 * down to core chart.
 */
const NON_CORE_PROPS: Array<keyof IBucketChartProps> = ["backend", "workspace"];

/**
 * Defines all the functions needed to render a chart.
 */
export interface IChartDefinition<
    TBucketProps extends object,
    TProps extends TBucketProps & IBucketChartProps,
> {
    chartName: string;
    /**
     * Function that may do initial transformation of the props. The returned props will then be used in
     * all following steps. If this function is not specified, then the props will be passed as-is.
     */
    propTransformation?: (props: TProps) => TProps;
    /**
     * Function converting bucket props to the relevant buckets.
     */
    bucketsFactory: (props: TBucketProps) => IBucket[];
    /**
     * All the keys in the chart BucketProps interface.
     */
    bucketPropsKeys: Array<keyof TBucketProps>;
    /**
     * Function creating an execution from props and buckets.
     */
    executionFactory: (props: TProps, buckets: IBucket[]) => IPreparedExecution;
    /**
     * Function creating prop overrides from props and buckets (e.g. custom config).
     */
    propOverridesFactory?: (props: TProps, buckets: IBucket[]) => Partial<IBucketChartProps>;
    /**
     * Place to put any side-effectful functions, like validation of props to show a warning etc.
     */
    onBeforePropsConversion?: (props: TProps) => void;
}

export const getCoreChartProps =
    <TBucketProps extends object, TProps extends TBucketProps & IBucketChartProps>(
        chart: IChartDefinition<TBucketProps, TProps>,
    ) =>
    (props: TProps): ICoreChartProps => {
        const propsToUse = chart.propTransformation ? chart.propTransformation(props) : props;

        if (chart.onBeforePropsConversion) {
            chart.onBeforePropsConversion(propsToUse);
        }

        const buckets = chart.bucketsFactory(propsToUse);
        const execution = chart.executionFactory(propsToUse, buckets);
        const nonBucketProps = omit(propsToUse, chart.bucketPropsKeys);
        const propOverrides = chart.propOverridesFactory
            ? chart.propOverridesFactory(propsToUse, buckets)
            : {};
        const exportTitle = propsToUse.exportTitle || chart.chartName;
        const coreChartProps = {
            ...nonBucketProps,
            ...propOverrides,
            execution,
            exportTitle,
        };

        return omit(coreChartProps, NON_CORE_PROPS);
    };
