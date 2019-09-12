import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IBucket } from "@gooddata/sdk-model";
import omit from "lodash/omit";

import { IChartProps, ICommonChartProps } from "../chartProps";

/**
 * Defines all the functions needed to render a chart.
 */
export interface IChartDefinition<
    TBucketProps extends object,
    TProps extends TBucketProps & ICommonChartProps
> {
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
    propOverridesFactory?: (props: TProps, buckets: IBucket[]) => Partial<ICommonChartProps>;
    /**
     * Place to put any side-effectful functions, like validation of props to show a warning etc.
     */
    onBeforePropsConversion?: (props: TProps) => void;
}

export const getCoreChartProps = <
    TBucketProps extends object,
    TProps extends TBucketProps & ICommonChartProps
>(
    chart: IChartDefinition<TBucketProps, TProps>,
) => (props: TProps): IChartProps => {
    if (chart.onBeforePropsConversion) {
        chart.onBeforePropsConversion(props);
    }

    const buckets = chart.bucketsFactory(props);
    const execution = chart.executionFactory(props, buckets);
    const nonBucketProps = omit(props, chart.bucketPropsKeys);
    const propOverrides = chart.propOverridesFactory ? chart.propOverridesFactory(props, buckets) : {};
    return {
        ...nonBucketProps,
        ...propOverrides,
        execution,
        backend: props.backend, // make sure the required props are not removed
    };
};
