// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

/**
 * Sub-context for the scheduled-email management dialog.
 * The connector hydrates this from dashboard state.
 *
 * Values already available on AutomationsContext (locale, currentUser, timezone,
 * isWhiteLabeled, isExecutionTimestampMode, externalRecipient, features.*) are NOT
 * duplicated here — consumers read those from useAutomationsContext().
 *
 * @internal
 */
export interface IScheduledEmailManagementDialogContextValue {
    /**
     * Whether the scheduled-email create/edit dialog is currently open (from store UI slice).
     * Used by the management dialog tree's focus-return logic (refocus when the edit dialog closes).
     */
    isScheduleEmailDialogOpen: boolean;
    /**
     * Monotonic counter that increments whenever the automation list is invalidated.
     * Consumers can use this as a cache-bust key for re-fetching.
     */
    automationsInvalidationId?: number;
    /**
     * Whether accessibility mode is active (for aria/keyboard focus management).
     */
    enableAccessibilityMode: boolean;
    /**
     * Whether the dashboard is rendered in an embedded (iframe) context.
     */
    isEmbedded: boolean;
    /**
     * Id of the dashboard the management dialog is rendered on (mirrors alerting management ctx).
     * Used to preselect the dashboard filter in the enhanced automations list.
     */
    dashboardId?: string;
    /**
     * Title of the dashboard the management dialog is rendered on (mirrors alerting management ctx).
     * Used as the label of the preselected dashboard filter in the enhanced automations list.
     */
    dashboardTitle?: string;
    /**
     * Maximum number of automations allowed (derived connector-side from the
     * max-automations entitlement, falling back to DEFAULT_MAX_AUTOMATIONS).
     * Combined with the dialog's automations count to gate the create button.
     */
    maxAutomations: number;
    /**
     * Whether the unlimited-automations entitlement is present. When true the
     * max-automations limit is not enforced.
     */
    unlimitedAutomations: boolean;
}

const ScheduledEmailManagementDialogContext = createContext<
    IScheduledEmailManagementDialogContextValue | undefined
>(undefined);

export const ScheduledEmailManagementDialogContextProvider = ScheduledEmailManagementDialogContext.Provider;

export function useScheduledEmailManagementDialogContext(): IScheduledEmailManagementDialogContextValue {
    const ctx = useContext(ScheduledEmailManagementDialogContext);
    if (!ctx) {
        throw new Error(
            "useScheduledEmailManagementDialogContext must be used within ScheduledEmailManagementDialogContextProvider",
        );
    }
    return ctx;
}
