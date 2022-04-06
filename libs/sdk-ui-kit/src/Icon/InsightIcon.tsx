// (C) 2022 GoodData Corporation
import React from "react";
import { Icon } from "./Icon";
import { IIconProps } from "./typings";

const INSIGHT_ICON_MAP = {
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
export const InsightIcon: React.FC<IInsightIconProps> = ({ visualizationUrl, iconProps = {} }) => {
    if (!visualizationUrl || !INSIGHT_ICON_MAP[visualizationUrl]) {
        return null;
    }

    return INSIGHT_ICON_MAP[visualizationUrl](iconProps);
};
