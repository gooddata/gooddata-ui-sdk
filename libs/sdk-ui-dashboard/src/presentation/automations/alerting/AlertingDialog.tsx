// (C) 2020-2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import {
    type IAlertingDialogContextValue,
    useAlertingDialogContext,
} from "../contexts/AlertingDialogContext.js";
import { useDecoratorContractCheck } from "../shared/hooks/useDecoratorContractCheck.js";

import { AlertingDialogStateProvider } from "./state/AlertingDialogStateProvider.js";
import { type IAlertingDialogProps } from "./types.js";

/**
 * Resolves the dialog component from DashboardComponentsContext and mounts it under the
 * alerting dialog's state contexts, inside the resolved context decorator — so a decorated
 * dialog context is what both the state seeding and the dialog (default or replacement) read.
 * A contract check between the decorator and the state provider warns once per dialog open
 * when the decorated value forces `isLoading` false during loading or drops connector keys.
 *
 * @internal
 */
export function AlertingDialog(props: IAlertingDialogProps): ReactElement {
    const { AlertingDialogComponent, AlertingDialogContextDecoratorComponent } =
        useDashboardComponentsContext();
    const pristineContext = useAlertingDialogContext();

    return (
        <AlertingDialogContextDecoratorComponent>
            <AlertingDialogDecoratorContractCheck pristineContext={pristineContext}>
                <AlertingDialogStateProvider>
                    <AlertingDialogComponent {...props} />
                </AlertingDialogStateProvider>
            </AlertingDialogDecoratorContractCheck>
        </AlertingDialogContextDecoratorComponent>
    );
}

function AlertingDialogDecoratorContractCheck({
    pristineContext,
    children,
}: {
    pristineContext: IAlertingDialogContextValue;
    children?: ReactNode;
}): ReactElement {
    const decoratedContext = useAlertingDialogContext();

    useDecoratorContractCheck(pristineContext, decoratedContext, "AlertingDialogContextDecoratorComponent");

    return <>{children}</>;
}
