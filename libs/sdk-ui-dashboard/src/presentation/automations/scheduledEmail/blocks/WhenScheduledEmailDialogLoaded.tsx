// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";

/**
 * Renders its children only once the scheduled-export dialog's data has loaded — the state accessors
 * throw while `useScheduledEmailDialogContext().isLoading` is true, because the state providers mount
 * only then. Every connected scheduled-email block goes through it. On scheduled email this state is
 * on the ordinary path — a widget export renders while its filters load — so a shell sees its blocks
 * appear once loading ends.
 *
 * @internal
 */
export function WhenScheduledEmailDialogLoaded({ children }: { children: ReactNode }) {
    const { isLoading } = useScheduledEmailDialogContext();
    return isLoading ? null : <>{children}</>;
}
