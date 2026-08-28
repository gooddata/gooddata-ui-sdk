// (C) 2026 GoodData Corporation

import { resolveTimezoneId } from "@gooddata/sdk-model";

import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { type IScheduleTimezoneSelection } from "../types.js";

/**
 * Export-content timezone inputs for scheduled export definitions (unrelated to the schedule
 * cron timezone). What gets baked into a NEW schedule — and what the Default option means —
 * differs by schedule kind, because of what the backend can derive at run time:
 *
 * - Dashboard schedules: the backend loads the stored dashboard, so only values it cannot derive
 *   (view-mode override, browser resolution) are baked; Default resolves through the persisted
 *   dashboard configuration to the workspace/organization setting.
 * - Widget schedules: the backend service has ONLY the workspace/organization settings available
 *   (it does not load the dashboard object), so anything dashboard-scoped — the stored dashboard
 *   configuration, the view-mode override, or the browser resolution — must be baked into the
 *   definition. Default then means just the workspace/organization setting.
 *
 * The store-derived inputs arrive via {@link useAutomationsContext}, filled by the connectors
 * layer — the scheduledEmail tree must not read the dashboard store itself.
 */
export function useExportTimezones(isWidgetSchedule: boolean): {
    /**
     * The enableTimezoneChange setting; timezone-related presentation changes in the
     * dialog are gated by it.
     */
    isTimezoneFeatureEnabled: boolean;
    /**
     * Whether the schedule may define its own export timezone (the "Time zone" section renders
     * a dropdown): the feature is enabled and the dashboard allows the view-mode timezone
     * override. False also for dashboards that only show the timezone info (showTimezoneInfo
     * without the override) — the schedule dialog then has no timezone section.
     */
    canSelectScheduleTimezone: boolean;
    workspaceTimezone: string | undefined;
    effectiveTimezone: string | undefined;
    /**
     * Timezone to bake into a NEW schedule's export definitions; undefined means nothing is baked
     * and the backend derives the timezone at run time.
     */
    exportTimezoneId: string | undefined;
    /**
     * Initial dropdown selection for a new schedule: dashboard schedules start at the Default
     * option unless an override/browser resolution must be baked; widget schedules always start
     * at a concrete resolved timezone (there is no Default for them).
     */
    initialSelection: IScheduleTimezoneSelection;
    /**
     * Concrete timezone the Default option currently resolves to, for display purposes: the
     * resolution the backend derives at run time for this schedule kind. The session-only
     * view-mode override is deliberately excluded — a schedule left at Default never sees it
     * (the override is instead baked as an explicit timezone via `exportTimezoneId`).
     */
    defaultResolvedTimezone: string | undefined;
} {
    const { exportTimezones } = useAutomationsContext();
    const {
        isTimezoneFeatureEnabled = false,
        allowUserOverrideInViewMode = false,
        configuredTimezoneId = undefined,
        workspaceTimezone = undefined,
        effectiveTimezone = undefined,
        scheduledExportTimezone: explicitTimezone = undefined,
    } = exportTimezones ?? {};

    const canSelectScheduleTimezone = isTimezoneFeatureEnabled && allowUserOverrideInViewMode;

    const initialSelection: IScheduleTimezoneSelection = isWidgetSchedule
        ? effectiveTimezone
            ? { id: effectiveTimezone, shouldSave: true }
            : { id: workspaceTimezone, shouldSave: false }
        : explicitTimezone
          ? { id: explicitTimezone, shouldSave: true }
          : { id: undefined, shouldSave: false };

    const exportTimezoneId = initialSelection.shouldSave ? initialSelection.id : undefined;

    const defaultResolvedTimezone = isWidgetSchedule
        ? workspaceTimezone
        : configuredTimezoneId
          ? resolveTimezoneId(configuredTimezoneId)
          : workspaceTimezone;

    return {
        isTimezoneFeatureEnabled,
        canSelectScheduleTimezone,
        workspaceTimezone,
        effectiveTimezone,
        exportTimezoneId,
        initialSelection,
        defaultResolvedTimezone,
    };
}
