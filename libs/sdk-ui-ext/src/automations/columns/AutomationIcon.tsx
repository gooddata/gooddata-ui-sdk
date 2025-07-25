// (C) 2025 GoodData Corporation

import React from "react";
import { AutomationsType } from "../types.js";
import { UiIcon } from "@gooddata/sdk-ui-kit";

export const AutomationIcon = ({ type }: { type: AutomationsType }) => {
    const iconType = type === "schedule" ? "clock" : "alert";
    return (
        <UiIcon
            type={iconType}
            size={14}
            color="complementary-6"
            backgroundSize={27}
            backgroundColor="complementary-2"
        />
    );
};
