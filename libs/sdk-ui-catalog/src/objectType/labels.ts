// (C) 2025-2026 GoodData Corporation

import { type IntlShape, type MessageDescriptor, defineMessages } from "react-intl";

import { ObjectTypes } from "./constants.js";
import type { ObjectType } from "./types.js";
import type { VisualizationType } from "../catalogItem/types.js";

const objectTypeMessages: Record<ObjectType, MessageDescriptor> = defineMessages({
    [ObjectTypes.DASHBOARD]: { id: "analyticsCatalog.objectType.dashboard.name" },
    [ObjectTypes.VISUALIZATION]: { id: "analyticsCatalog.objectType.visualization.name" },
    [ObjectTypes.METRIC]: { id: "analyticsCatalog.objectType.metric.name" },
    [ObjectTypes.ATTRIBUTE]: { id: "analyticsCatalog.objectType.attribute.name" },
    [ObjectTypes.FACT]: { id: "analyticsCatalog.objectType.fact.name" },
    [ObjectTypes.DATASET]: { id: "analyticsCatalog.objectType.dateDataset.name" },
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

/**
 * Returns the canonical display name for a catalog object type.
 * When the type is `"insight"` and a specific visualization type is known,
 * the more specific visualization label is returned instead.
 */
export function getObjectTypeLabel(
    intl: IntlShape,
    type: ObjectType,
    visualizationType?: VisualizationType,
): string {
    if (type === "insight" && visualizationType && visualizationType in visualizationTypeMessages) {
        return intl.formatMessage(visualizationTypeMessages[visualizationType]);
    }
    const message = objectTypeMessages[type];
    if (!message) {
        return type;
    }
    return intl.formatMessage(message);
}
