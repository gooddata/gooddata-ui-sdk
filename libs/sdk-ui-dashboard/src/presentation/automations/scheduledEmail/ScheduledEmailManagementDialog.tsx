// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

import { type IScheduledEmailManagementDialogProps } from "./types.js";

/**
 * Resolves the management dialog component from DashboardComponentsContext and mounts it inside
 * the resolved context decorator — so a decorated management context is what the dialog (default
 * or replacement) reads.
 *
 * @internal
 */
export function ScheduledEmailManagementDialog(props: IScheduledEmailManagementDialogProps): ReactElement {
    const {
        ScheduledEmailManagementDialogComponent,
        ScheduledEmailManagementDialogContextDecoratorComponent,
    } = useDashboardComponentsContext();

    return (
        <ScheduledEmailManagementDialogContextDecoratorComponent>
            <ScheduledEmailManagementDialogComponent {...props} />
        </ScheduledEmailManagementDialogContextDecoratorComponent>
    );
}
