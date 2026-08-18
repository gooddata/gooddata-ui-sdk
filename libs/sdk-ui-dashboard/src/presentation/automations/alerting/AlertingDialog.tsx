// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

import { AlertingDialogStateProvider } from "./state/AlertingDialogStateProvider.js";
import { type IAlertingDialogProps } from "./types.js";

/**
 * Resolves the dialog component from DashboardComponentsContext and mounts it under the
 * alerting dialog's state contexts, inside the resolved context decorator — so a decorated
 * dialog context is what both the state seeding and the dialog (default or replacement) read.
 *
 * @internal
 */
export function AlertingDialog(props: IAlertingDialogProps): ReactElement {
    const { AlertingDialogComponent, AlertingDialogContextDecoratorComponent } =
        useDashboardComponentsContext();

    return (
        <AlertingDialogContextDecoratorComponent>
            <AlertingDialogStateProvider>
                <AlertingDialogComponent {...props} />
            </AlertingDialogStateProvider>
        </AlertingDialogContextDecoratorComponent>
    );
}
