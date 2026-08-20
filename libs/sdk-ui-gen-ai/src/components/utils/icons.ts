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

export function getIconByType(type: IGenAIContextObject["type"]): {
    iconBefore?: IconType;
    iconColor?: ThemeColor;
} {
    switch (type) {
        case "dashboard":
            return {
                iconBefore: "dashboard",
                iconColor: "complementary-6",
            };
        case "visualization":
        case "widget":
            return {
                iconBefore: "visualization",
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
