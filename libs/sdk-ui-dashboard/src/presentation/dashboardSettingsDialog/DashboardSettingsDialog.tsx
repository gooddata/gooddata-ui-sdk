// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { IDashboardSettingsDialogProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";

/**
 * @internal
 */
export const DashboardSettingsDialog = (props: IDashboardSettingsDialogProps): ReactElement => {
    const { DashboardSettingsDialogComponent } = useDashboardComponentsContext();

    return <DashboardSettingsDialogComponent {...props} />;
};
