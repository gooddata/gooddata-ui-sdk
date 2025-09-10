// (C) 2025 GoodData Corporation

import React, { memo } from "react";

import cx from "classnames";

import { type IconType, UiIcon } from "@gooddata/sdk-ui-kit";

import type { ObjectType } from "./types.js";
import type { VisualizationType } from "../catalogItem/types.js";

type Props = {
    type: ObjectType;
    visualizationType?: VisualizationType;
    size?: 26 | 32;
};

export function ObjectTypeIcon({ type, size = 26, visualizationType }: Props) {
    return (
        <div className={cx("gd-analytics-catalog__object-type", "gd-analytics-catalog__table__column-icon")}>
            <div data-object-type={type}>
                {type === "attribute" ? <UiIcon type="ldmAttribute" size={14} backgroundSize={size} /> : null}
                {type === "fact" ? <UiIcon type="fact" size={14} backgroundSize={size} /> : null}
                {type === "measure" ? <UiIcon type="metric" size={14} backgroundSize={size} /> : null}
                {type === "analyticalDashboard" ? (
                    <UiIcon type="dashboard" size={14} backgroundSize={size} />
                ) : null}
                {type === "insight" ? (
                    <UiIcon
                        type={
                            (visualizationType && visualizationIconMap[visualizationType]) ?? "visualization"
                        }
                        size={14}
                        backgroundSize={size}
                    />
                ) : null}
            </div>
        </div>
    );
}

const visualizationIconMap: Record<string, IconType> = {
    table: "visualizationTable",
    area: "visualizationArea",
    treemap: "visualizationTreemap",
    scatter: "visualizationScatter",
    donut: "visualizationDonut",
    headline: "visualizationHeadline",
    column: "visualizationColumn",
    line: "visualizationLine",
    pyramid: "visualizationPyramid",
    funnel: "visualizationFunnel",
    heatmap: "visualizationHeatmap",
    bubble: "visualizationBubble",
    pie: "visualizationPie",
    bar: "visualizationBar",
    combo: "visualizationCombo",
    bullet: "visualizationBullet",
    waterfall: "visualizationWaterfall",
    dependencywheel: "visualizationDependencywheel",
    sankey: "visualizationSankey",
    pushpin: "visualizationPushpin",
    repeater: "visualizationRepeater",
};

export const ObjectTypeIconMemo = memo(ObjectTypeIcon);
