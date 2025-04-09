// (C) 2021-2025 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../../../dashboardContexts/index.js";

import { ISettingButtonProps } from "./types.js";

/**
 * @internal
 */
export const SettingButton = (props: ISettingButtonProps): JSX.Element => {
    const { SettingButtonComponent } = useDashboardComponentsContext();
    return <SettingButtonComponent {...props} />;
};
