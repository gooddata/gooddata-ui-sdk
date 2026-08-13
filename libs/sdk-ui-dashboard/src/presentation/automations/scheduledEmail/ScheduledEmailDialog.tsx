// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

import { ScheduledEmailDialogStateProvider } from "./state/ScheduledEmailDialogStateProvider.js";
import { type IScheduledEmailDialogProps } from "./types.js";

/**
 * Resolves the dialog component from DashboardComponentsContext and mounts it under the
 * scheduled-export dialog's state contexts.
 *
 * @internal
 */
export function ScheduledEmailDialog(props: IScheduledEmailDialogProps): ReactElement {
    const { ScheduledEmailDialogComponent } = useDashboardComponentsContext();

    return (
        <ScheduledEmailDialogStateProvider>
            <ScheduledEmailDialogComponent {...props} />
        </ScheduledEmailDialogStateProvider>
    );
}
