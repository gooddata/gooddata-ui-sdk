// (C) 2020-2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import {
    type IScheduledEmailDialogContextValue,
    useScheduledEmailDialogContext,
} from "../contexts/ScheduledEmailDialogContext.js";
import { useDecoratorContractCheck } from "../shared/hooks/useDecoratorContractCheck.js";

import { ScheduledEmailDialogStateProvider } from "./state/ScheduledEmailDialogStateProvider.js";
import { type IScheduledEmailDialogProps } from "./types.js";

/**
 * Resolves the dialog component from DashboardComponentsContext and mounts it under the
 * scheduled-export dialog's state contexts, inside the resolved context decorator — so a
 * decorated dialog context is what both the state seeding and the dialog (default or
 * replacement) read. A contract check between the decorator and the state provider warns once
 * per dialog open when the decorated value forces `isLoading` false during loading or drops
 * connector keys.
 *
 * @internal
 */
export function ScheduledEmailDialog(props: IScheduledEmailDialogProps): ReactElement {
    const { ScheduledEmailDialogComponent, ScheduledEmailDialogContextDecoratorComponent } =
        useDashboardComponentsContext();
    const pristineContext = useScheduledEmailDialogContext();

    return (
        <ScheduledEmailDialogContextDecoratorComponent>
            <ScheduledEmailDialogDecoratorContractCheck pristineContext={pristineContext}>
                <ScheduledEmailDialogStateProvider>
                    <ScheduledEmailDialogComponent {...props} />
                </ScheduledEmailDialogStateProvider>
            </ScheduledEmailDialogDecoratorContractCheck>
        </ScheduledEmailDialogContextDecoratorComponent>
    );
}

function ScheduledEmailDialogDecoratorContractCheck({
    pristineContext,
    children,
}: {
    pristineContext: IScheduledEmailDialogContextValue;
    children?: ReactNode;
}): ReactElement {
    const decoratedContext = useScheduledEmailDialogContext();

    useDecoratorContractCheck(
        pristineContext,
        decoratedContext,
        "ScheduledEmailDialogContextDecoratorComponent",
    );

    return <>{children}</>;
}
