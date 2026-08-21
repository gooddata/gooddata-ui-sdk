// (C) 2026 GoodData Corporation

import { type IntlShape, defineMessages } from "react-intl";

import { type IconType, type ThemeColor } from "@gooddata/sdk-ui-kit";

import { type IGenAIContextObject } from "../../types.js";

const msgs = defineMessages({
    typeDashboard: {
        id: "gd.gen-ai.context.type.dashboard",
    },
    typeVisualization: {
        id: "gd.gen-ai.context.type.visualization",
    },
});

const VISUALIZATION_TYPE_ICONS: Record<string, IconType> = {
    area: "visualizationArea",
    bar: "visualizationBar",
    bubble: "visualizationBubble",
    bullet: "visualizationBullet",
    column: "visualizationColumn",
    combo: "visualizationCombo",
    combo2: "visualizationCombo",
    dependencywheel: "visualizationDependencywheel",
    donut: "visualizationDonut",
    funnel: "visualizationFunnel",
    headline: "visualizationHeadline",
    heatmap: "visualizationHeatmap",
    line: "visualizationLine",
    pie: "visualizationPie",
    pushpin: "visualizationPushpin",
    pushpinnext: "visualizationPushpin",
    pyramid: "visualizationPyramid",
    repeater: "visualizationRepeater",
    sankey: "visualizationSankey",
    scatter: "visualizationScatter",
    table: "visualizationTable",
    tablenext: "visualizationTable",
    treemap: "visualizationTreemap",
    waterfall: "visualizationWaterfall",
    xirr: "visualizationXirr",
};

export function getIconByObject(object: Pick<IGenAIContextObject, "type" | "visualizationUrl">): {
    iconBefore?: IconType;
    iconColor?: ThemeColor;
} {
    switch (object.type) {
        case "dashboard":
            return {
                iconBefore: "dashboard",
                iconColor: "complementary-6",
            };
        case "visualization":
        case "widget":
            return {
                iconBefore: getVisualizationIcon(object.visualizationUrl),
                iconColor: "complementary-6",
            };
        default:
            return {};
    }
}

export function getTypeLabel(type: IGenAIContextObject["type"], intl: IntlShape): string | undefined {
    switch (type) {
        case "dashboard":
            return intl.formatMessage(msgs.typeDashboard);
        case "visualization":
        case "widget":
            return intl.formatMessage(msgs.typeVisualization);
        default:
            return undefined;
    }
}

function getVisualizationIcon(visualizationUrl: string | undefined): IconType {
    const type = visualizationUrl?.split(":").at(-1);

    return type && Object.hasOwn(VISUALIZATION_TYPE_ICONS, type)
        ? VISUALIZATION_TYPE_ICONS[type]
        : "visualization";
}
