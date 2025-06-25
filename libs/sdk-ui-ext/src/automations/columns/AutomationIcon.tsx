// (C) 2025 GoodData Corporation

import React from "react";
import { AutomationsType } from "../types.js";
import { UiIcon } from "@gooddata/sdk-ui-kit";
import { bem } from "../../notificationsPanel/bem.js";
const { b } = bem("gd-ui-ext-automation-icon");

export const AutomationIcon = ({ type }: { type: AutomationsType }) => {
    const iconType = type === "schedule" ? "clock" : "alert";
    return (
        <div className={b()}>
            <UiIcon type={iconType} size={14} color="complementary-6" />
        </div>
    );
};
