// (C) 2019 GoodData Corporation
import React from "react";
import compose from "lodash/flowRight.js";
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition.js";
import { IBucketChartProps, ICoreChartProps } from "../../interfaces/index.js";
import { withContexts, wrapDisplayName } from "@gooddata/sdk-ui";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

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
export const withChart =
    <TBucketProps extends object, TProps extends TBucketProps & IBucketChartProps>(
        chartDefinition: IChartDefinition<TBucketProps, TProps>,
    ) =>
    (Chart: React.ComponentType<ICoreChartProps>): React.ComponentType<TProps> =>
        compose(
            wrapDisplayName("withChart"),
            withTheme,
            withContexts,
            withChartDefinition(chartDefinition),
        )(Chart);
