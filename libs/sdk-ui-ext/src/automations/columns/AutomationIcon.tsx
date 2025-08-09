// (C) 2025 GoodData Corporation

import React from "react";
import { AutomationsType } from "../types.js";
import { UiIcon } from "@gooddata/sdk-ui-kit";
import { IAutomationStatus } from "@gooddata/sdk-model";
import { AUTOMATION_ICON_CONFIGS } from "../constants.js";

export const AutomationIcon = ({ type }: { type: AutomationsType | IAutomationStatus }) => {
    if (!type) {
        return null;
    }

    const {
        type: iconType,
        size,
        color,
        backgroundSize,
        backgroundColor,
        backgroundType,
    } = AUTOMATION_ICON_CONFIGS[type];

    return (
        <UiIcon
            type={iconType}
            size={size}
            color={color}
            backgroundSize={backgroundSize}
            backgroundColor={backgroundColor}
            backgroundType={backgroundType}
        />
    );
};
