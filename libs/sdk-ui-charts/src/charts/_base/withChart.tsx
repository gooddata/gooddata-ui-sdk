// (C) 2019-2025 GoodData Corporation

import { ComponentType } from "react";

import compose from "lodash/flowRight.js";

import { withContexts, wrapDisplayName } from "@gooddata/sdk-ui";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import { IBucketChartProps, ICoreChartProps } from "../../interfaces/index.js";
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition.js";

/**
 * Hoc that transforms incoming props to BaseChart props according to chart definition
 * @internal
 */
function withChartDefinition<TBucketProps extends object, TProps extends TBucketProps & IBucketChartProps>(
    chartDefinition: IChartDefinition<TBucketProps, TProps>,
) {
    const getChartProps = getCoreChartProps(chartDefinition);
    return (Chart: ComponentType<ICoreChartProps>): ComponentType<TProps> => {
        function WithChartDefinition(props: TProps) {
            return <Chart {...getChartProps(props)} />;
        }
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
    (Chart: ComponentType<ICoreChartProps>): ComponentType<TProps> =>
        compose(
            wrapDisplayName("withChart"),
            withTheme,
            withContexts,
            withChartDefinition(chartDefinition),
        )(Chart);
