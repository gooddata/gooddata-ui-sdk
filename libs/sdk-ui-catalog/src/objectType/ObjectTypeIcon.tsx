// (C) 2025 GoodData Corporation

import { type ComponentProps, memo } from "react";

import cx from "classnames";

import { type IconType, UiIcon } from "@gooddata/sdk-ui-kit";

import type { ObjectType } from "./types.js";
import type { VisualizationType } from "../catalogItem/types.js";

type Props = ComponentProps<"div"> & {
    type: ObjectType;
    visualizationType?: VisualizationType;
    size?: 14 | 18;
    backgroundSize?: 26 | 32;
};

export function ObjectTypeIcon({
    type,
    size = 14,
    backgroundSize,
    visualizationType,
    className,
    ...htmlProps
}: Props) {
    const sizes = { size, backgroundSize };
    return (
        <span
            {...htmlProps}
            className={cx("gd-analytics-catalog__object-type", className)}
            data-object-type={type}
        >
            {type === "attribute" ? <UiIcon type="ldmAttribute" {...sizes} /> : null}
            {type === "fact" ? <UiIcon type="fact" {...sizes} /> : null}
            {type === "measure" ? <UiIcon type="metric" {...sizes} /> : null}
            {type === "analyticalDashboard" ? <UiIcon type="dashboard" {...sizes} /> : null}
            {type === "dataSet" ? <UiIcon type="date" {...sizes} /> : null}
            {type === "insight" ? (
                <UiIcon
                    type={(visualizationType && visualizationIconMap[visualizationType]) ?? "visualization"}
                    {...sizes}
                />
            ) : null}
        </span>
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
