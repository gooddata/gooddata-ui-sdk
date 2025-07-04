// (C) 2022-2025 GoodData Corporation
import { ComponentType } from "react";
import { Icon } from "./Icon.js";
import { IIconProps } from "./typings.js";

const INSIGHT_ICON_MAP: Record<string, ComponentType<IIconProps>> = {
    "local:scatter": Icon.ScatterPlot,
    "local:donut": Icon.Donut,
    "local:headline": Icon.HeadlineChart,
    "local:treemap": Icon.TreeMap,
    "local:combo2": Icon.Combo,
    "local:heatmap": Icon.HeatMap,
    "local:bubble": Icon.Bubble,
    "local:bullet": Icon.Bullet,
    "local:bar": Icon.Bar,
    "local:table": Icon.Table,
    "local:area": Icon.StackedArea,
    "local:column": Icon.Column,
    "local:line": Icon.Line,
    "local:pushpin": Icon.Geo,
    "local:pie": Icon.Pie,
    "local:sankey": Icon.Sankey,
    "local:dependencywheel": Icon.DependencyWheel,
    "local:funnel": Icon.Funnel,
    "local:pyramid": Icon.Pyramid,
    "local:waterfall": Icon.Waterfall,
    "local:repeater": Icon.Repeater,
};

/**
 * @internal
 */
export interface IInsightIconProps {
    visualizationUrl?: string;
    iconProps?: IIconProps;
}

/**
 * @internal
 */
export function InsightIcon({ visualizationUrl, iconProps = {} }: IInsightIconProps) {
    if (!visualizationUrl || !INSIGHT_ICON_MAP[visualizationUrl]) {
        return null;
    }

    const IconComponent = INSIGHT_ICON_MAP[visualizationUrl];
    return <IconComponent {...iconProps} />;
}
