// (C) 2021-2025 GoodData Corporation
import React, { ReactElement } from "react";
import { useDashboardComponentsContext } from "../../../../dashboardContexts/index.js";

import { ISettingButtonProps } from "./types.js";

/**
 * @internal
 */
export const SettingButton = (props: ISettingButtonProps): ReactElement => {
    const { SettingButtonComponent } = useDashboardComponentsContext();
    return <SettingButtonComponent {...props} />;
};
