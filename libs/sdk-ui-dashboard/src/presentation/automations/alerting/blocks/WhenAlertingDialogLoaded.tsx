// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";

/**
 * Renders its children only once the alerting dialog's data has loaded — the state accessors throw
 * while `useAlertingDialogContext().isLoading` is true, because the state providers mount only then.
 * Every connected alerting block goes through it.
 *
 * @internal
 */
export function WhenAlertingDialogLoaded({ children }: { children: ReactNode }) {
    const { isLoading } = useAlertingDialogContext();
    return isLoading ? null : <>{children}</>;
}
