// (C) 2020-2025 GoodData Corporation
import { ReactElement } from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IDashboardSettingsDialogProps } from "./types.js";

/**
 * @internal
 */
export function DashboardSettingsDialog(props: IDashboardSettingsDialogProps): ReactElement {
    const { DashboardSettingsDialogComponent } = useDashboardComponentsContext();

    return <DashboardSettingsDialogComponent {...props} />;
}
