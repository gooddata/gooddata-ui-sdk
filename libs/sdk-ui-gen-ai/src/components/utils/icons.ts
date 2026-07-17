// (C) 2026 GoodData Corporation

import { type GenAIObjectType } from "@gooddata/sdk-model";
import { type IconType, type ThemeColor } from "@gooddata/sdk-ui-kit";

export function getIconByType(type: GenAIObjectType): { iconBefore?: IconType; iconColor?: ThemeColor } {
    switch (type) {
        case "dashboard":
            return {
                iconBefore: "dashboard",
                iconColor: "complementary-6",
            };
        case "visualization":
            return {
                iconBefore: "visualization",
            };
        default:
            return {};
    }
}
