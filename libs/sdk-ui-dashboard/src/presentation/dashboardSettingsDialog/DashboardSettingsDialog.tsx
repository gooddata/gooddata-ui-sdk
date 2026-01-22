// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IDashboardSettingsDialogProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function DashboardSettingsDialog(props: IDashboardSettingsDialogProps): ReactElement {
    const { DashboardSettingsDialogComponent } = useDashboardComponentsContext();

    return <DashboardSettingsDialogComponent {...props} />;
}
