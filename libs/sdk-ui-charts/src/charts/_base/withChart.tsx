// (C) 2019 GoodData Corporation
import * as React from "react";
import compose = require("lodash/flowRight");
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition";
import { IBucketChartProps, ICoreChartProps } from "../chartProps";
import { withContexts, wrapDisplayName } from "@gooddata/sdk-ui";

/**
 * Hoc that transforms incoming props to BaseChart props according to chart definition
 * @internal
 */
function withChartDefinition<TBucketProps extends object, TProps extends TBucketProps & IBucketChartProps>(
    chartDefinition: IChartDefinition<TBucketProps, TProps>,
) {
    const getChartProps = getCoreChartProps(chartDefinition);
    return (Chart: React.ComponentType<ICoreChartProps>): React.ComponentType<TProps> => {
        const WithChartDefinition = (props: TProps) => <Chart {...getChartProps(props)} />;
        return wrapDisplayName("withChartDefinition", Chart)(WithChartDefinition);
    };
}

/**
 * Common hoc for shared logic between all charts, injects contexts and transforms incoming props to BaseChart props according to chart definition
 * @internal
 */
export const withChart = <TBucketProps extends object, TProps extends TBucketProps & IBucketChartProps>(
    chartDefinition: IChartDefinition<TBucketProps, TProps>,
) => (Chart: React.ComponentType<ICoreChartProps>): React.ComponentType<TProps> =>
    compose(wrapDisplayName("withChart"), withContexts, withChartDefinition(chartDefinition))(Chart);
