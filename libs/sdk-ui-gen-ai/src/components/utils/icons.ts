// (C) 2026 GoodData Corporation

import { type IconType, type ThemeColor } from "@gooddata/sdk-ui-kit";

import { type IGenAIContextObject } from "../../types.js";

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
