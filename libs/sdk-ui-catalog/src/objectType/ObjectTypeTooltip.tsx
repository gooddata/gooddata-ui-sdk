// (C) 2025 GoodData Corporation

import type { ReactNode } from "react";

import { type IntlShape, type MessageDescriptor, defineMessages } from "react-intl";

import { UiTooltip } from "@gooddata/sdk-ui-kit";

import type { ObjectType } from "./types.js";
import type { VisualizationType } from "../catalogItem/types.js";

type Props = {
    intl: IntlShape;
    type: ObjectType;
    visualizationType?: VisualizationType;
    anchor: ReactNode;
};

export function ObjectTypeTooltip({ intl, type, visualizationType, anchor }: Props) {
    const tooltipContent = getTooltipContent(intl, type, visualizationType);
    return (
        <UiTooltip
            arrowPlacement="top"
            optimalPlacement
            triggerBy={["hover"]}
            anchor={anchor}
            content={tooltipContent}
        />
    );
}

const objectTypeMessages: Record<ObjectType, MessageDescriptor> = defineMessages({
    analyticalDashboard: { id: "analyticsCatalog.objectType.dashboard.tooltip" },
    insight: { id: "analyticsCatalog.objectType.visualization.tooltip" },
    measure: { id: "analyticsCatalog.objectType.metric.tooltip" },
    attribute: { id: "analyticsCatalog.objectType.attribute.tooltip" },
    fact: { id: "analyticsCatalog.objectType.fact.tooltip" },
    dataSet: { id: "analyticsCatalog.objectType.dateDataset.tooltip" },
});

const visualizationTypeMessages: Record<VisualizationType, MessageDescriptor> = defineMessages({
    table: { id: "analyticsCatalog.visualizationType.table.tooltip" },
    area: { id: "analyticsCatalog.visualizationType.area.tooltip" },
    treemap: { id: "analyticsCatalog.visualizationType.treemap.tooltip" },
    scatter: { id: "analyticsCatalog.visualizationType.scatter.tooltip" },
    donut: { id: "analyticsCatalog.visualizationType.donut.tooltip" },
    headline: { id: "analyticsCatalog.visualizationType.headline.tooltip" },
    column: { id: "analyticsCatalog.visualizationType.column.tooltip" },
    line: { id: "analyticsCatalog.visualizationType.line.tooltip" },
    pyramid: { id: "analyticsCatalog.visualizationType.pyramid.tooltip" },
    funnel: { id: "analyticsCatalog.visualizationType.funnel.tooltip" },
    heatmap: { id: "analyticsCatalog.visualizationType.heatmap.tooltip" },
    bubble: { id: "analyticsCatalog.visualizationType.bubble.tooltip" },
    pie: { id: "analyticsCatalog.visualizationType.pie.tooltip" },
    bar: { id: "analyticsCatalog.visualizationType.bar.tooltip" },
    combo: { id: "analyticsCatalog.visualizationType.combo.tooltip" },
    bullet: { id: "analyticsCatalog.visualizationType.bullet.tooltip" },
    waterfall: { id: "analyticsCatalog.visualizationType.waterfall.tooltip" },
    dependencywheel: { id: "analyticsCatalog.visualizationType.dependencywheel.tooltip" },
    sankey: { id: "analyticsCatalog.visualizationType.sankey.tooltip" },
    pushpin: { id: "analyticsCatalog.visualizationType.pushpin.tooltip" },
    repeater: { id: "analyticsCatalog.visualizationType.repeater.tooltip" },
});

function getTooltipContent(
    intl: IntlShape,
    type: ObjectType,
    visualizationType: VisualizationType | undefined,
): string {
    if (type === "insight" && visualizationType && visualizationType in visualizationTypeMessages) {
        return intl.formatMessage(visualizationTypeMessages[visualizationType]);
    }
    return intl.formatMessage(objectTypeMessages[type]);
}
