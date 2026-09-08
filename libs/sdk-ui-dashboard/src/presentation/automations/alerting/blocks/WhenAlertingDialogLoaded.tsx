// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";

/**
 * Renders its children only while `useAlertingDialogContext().isLoading` is false. The state
 * accessors throw until the dialog's data has first loaded; during a later refresh the state
 * model stays mounted and keeps serving, but the blocks still hide behind the loading state.
 * Every connected alerting block goes through it.
 *
 * @internal
 */
export function WhenAlertingDialogLoaded({ children }: { children: ReactNode }) {
    const { isLoading } = useAlertingDialogContext();
    return isLoading ? null : <>{children}</>;
}
