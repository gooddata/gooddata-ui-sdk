// (C) 2025-2026 GoodData Corporation

import { type ComponentProps, memo } from "react";

import cx from "classnames";
import type { IntlShape } from "react-intl";

import { type IconType, UiIcon } from "@gooddata/sdk-ui-kit";

import { getObjectTypeLabel } from "./labels.js";
import type { ObjectType } from "./types.js";
import type { VisualizationType } from "../catalogItem/types.js";

export type ObjectTypeIconProps = ComponentProps<"div"> & {
    intl: IntlShape;
    type: ObjectType;
    visualizationType?: VisualizationType;
    size?: 14 | 18;
    backgroundSize?: 26 | 32;
};

export function ObjectTypeIcon({
    intl,
    type,
    size = 14,
    backgroundSize,
    visualizationType,
    className,
    ...htmlProps
}: ObjectTypeIconProps) {
    const sizes = { size, backgroundSize };
    const label = getObjectTypeLabel(intl, type, visualizationType);
    return (
        <span
            {...htmlProps}
            className={cx("gd-analytics-catalog__object-type", className)}
            data-object-type={type}
        >
            {type === "attribute" ? (
                <UiIcon type="ldmAttribute" accessibilityConfig={{ ariaLabel: label }} {...sizes} />
            ) : null}
            {type === "fact" ? (
                <UiIcon type="fact" accessibilityConfig={{ ariaLabel: label }} {...sizes} />
            ) : null}
            {type === "measure" ? (
                <UiIcon type="metric" accessibilityConfig={{ ariaLabel: label }} {...sizes} />
            ) : null}
            {type === "analyticalDashboard" ? (
                <UiIcon type="dashboard" accessibilityConfig={{ ariaLabel: label }} {...sizes} />
            ) : null}
            {type === "dataSet" ? (
                <UiIcon type="date" accessibilityConfig={{ ariaLabel: label }} {...sizes} />
            ) : null}
            {type === "insight" ? (
                <UiIcon
                    type={(visualizationType && visualizationIconMap[visualizationType]) ?? "visualization"}
                    accessibilityConfig={{ ariaLabel: label }}
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
