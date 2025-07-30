// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IDashboardSettingsDialogProps } from "./types.js";

/**
 * @internal
 */
export const DashboardSettingsDialog = (props: IDashboardSettingsDialogProps): ReactElement => {
    const { DashboardSettingsDialogComponent } = useDashboardComponentsContext();

    return <DashboardSettingsDialogComponent {...props} />;
};
