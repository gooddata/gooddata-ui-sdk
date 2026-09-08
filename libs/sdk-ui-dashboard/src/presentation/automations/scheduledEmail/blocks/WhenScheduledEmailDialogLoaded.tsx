// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";

/**
 * Renders its children only while `useScheduledEmailDialogContext().isLoading` is false. The state
 * accessors throw until the dialog's data has first loaded; during a later refresh the state model
 * stays mounted and keeps serving, but the blocks still hide behind the loading state. Every
 * connected scheduled-email block goes through it. On scheduled email the loading state is on the
 * ordinary path — a widget export renders while its filters load — so a shell sees its blocks
 * appear once loading ends.
 *
 * @internal
 */
export function WhenScheduledEmailDialogLoaded({ children }: { children: ReactNode }) {
    const { isLoading } = useScheduledEmailDialogContext();
    return isLoading ? null : <>{children}</>;
}
