// (C) 2020-2025 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IDashboardSettingsDialogProps } from "./types.js";

/**
 * @internal
 */
export const DashboardSettingsDialog = (props: IDashboardSettingsDialogProps): JSX.Element => {
    const { DashboardSettingsDialogComponent } = useDashboardComponentsContext();

    return <DashboardSettingsDialogComponent {...props} />;
};
