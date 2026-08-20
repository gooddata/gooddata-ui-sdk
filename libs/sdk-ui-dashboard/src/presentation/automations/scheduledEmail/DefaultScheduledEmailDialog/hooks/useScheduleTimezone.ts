// (C) 2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback, useState } from "react";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IWidget,
} from "@gooddata/sdk-model";

import {
    getExportDefinitionsTimezone,
    withExportDefinitionsTimezone,
} from "../../state/exportDefinitions.js";
import { type IScheduleTimezoneSelection } from "../../types.js";

import { useExportTimezones } from "./useExportTimezones.js";

export interface IUseScheduleTimezoneProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
    widget?: IWidget;
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition>>;
}

/**
 * Owns the "Time zone" section state of the scheduled-email dialog.
 *
 * The selection (see {@link IScheduleTimezoneSelection}) decides what is baked into the export
 * definitions: backend-derivable values are displayed but not saved, everything else stores the
 * concrete timezone.
 * Widget schedules always show a concrete resolved timezone (no Default option); dashboard
 * schedules offer the Default option. The cron `schedule.timezone` is a different concept (when
 * the schedule fires) and is never touched here.
 */
export function useScheduleTimezone({
    scheduledExportToEdit,
    widget,
    setEditedAutomation,
}: IUseScheduleTimezoneProps) {
    const isWidget = !!widget;
    const { isTimezoneFeatureEnabled, canSelectScheduleTimezone, initialSelection, defaultResolvedTimezone } =
        useExportTimezones(isWidget);

    const storedTimezoneId = getExportDefinitionsTimezone(scheduledExportToEdit);

    const [selection, setSelection] = useState<IScheduleTimezoneSelection>(() => {
        if (!scheduledExportToEdit) {
            return initialSelection;
        }
        if (storedTimezoneId) {
            return { id: storedTimezoneId, shouldSave: true };
        }
        // an edited schedule without a stored timezone: widget schedules still present the
        // currently resolved timezone (they have no Default), dashboard schedules sit at Default
        return isWidget ? initialSelection : { id: undefined, shouldSave: false };
    });

    // A widget schedule must carry any dashboard-scoped timezone in its definitions (the backend
    // cannot derive it). An edited widget schedule without a stored timezone while a
    // dashboard-scoped one is effective is therefore structurally stale — same category as
    // filters that no longer exist on the dashboard — and is repaired through the
    // apply-current-state confirmation flow, never silently. Deliberately not gated by the
    // section's visibility: the repair matters even when the dashboard forbids the view-mode
    // override and the dialog shows no Time zone section.
    const scheduleTimezoneIsStale =
        isTimezoneFeatureEnabled &&
        isWidget &&
        !!scheduledExportToEdit &&
        !storedTimezoneId &&
        initialSelection.shouldSave &&
        !!initialSelection.id;

    // Both handlers are published on the actions context, so they hold their identity across
    // draft edits; they depend on the selection's primitive fields because `initialSelection`
    // is rebuilt on every render.
    const { id: initialSelectionId, shouldSave: initialSelectionShouldSave } = initialSelection;

    const applyCurrentScheduleTimezone = useCallback(() => {
        if (!scheduleTimezoneIsStale) {
            return;
        }
        setSelection({ id: initialSelectionId, shouldSave: initialSelectionShouldSave });
        setEditedAutomation((s) => withExportDefinitionsTimezone(s, initialSelectionId));
    }, [scheduleTimezoneIsStale, initialSelectionId, initialSelectionShouldSave, setEditedAutomation]);

    const onScheduleTimezoneChange = useCallback(
        (timezoneId: string | undefined) => {
            const nextSelection: IScheduleTimezoneSelection =
                timezoneId === undefined
                    ? { id: undefined, shouldSave: false }
                    : { id: timezoneId, shouldSave: true };
            setSelection(nextSelection);
            if (canSelectScheduleTimezone) {
                setEditedAutomation((s) => withExportDefinitionsTimezone(s, nextSelection.id));
            }
        },
        [canSelectScheduleTimezone, setEditedAutomation],
    );

    return {
        isTimezoneFeatureEnabled,
        canSelectScheduleTimezone,
        scheduleTimezoneSelection: selection,
        /**
         * Concrete timezone the dashboard-schedule Default option currently resolves to
         * (display only).
         */
        defaultResolvedTimezone,
        onScheduleTimezoneChange,
        /**
         * True when the edited schedule cannot behave correctly as stored (widget schedule
         * missing a dashboard-scoped timezone); feeds the apply-current-state confirmation.
         */
        scheduleTimezoneIsStale,
        applyCurrentScheduleTimezone,
        /**
         * Live value for export definitions created after the dialog opened (attachment changes).
         * Active when the section is interactive, and also when an edited schedule carries a
         * stored timezone while the section is hidden — new definitions must then inherit the
         * stored value instead of the store-derived default.
         */
        scheduleTimezone: {
            active: canSelectScheduleTimezone || !!storedTimezoneId,
            timezoneId: selection.shouldSave ? selection.id : undefined,
        },
    };
}

export type ScheduleTimezoneState = ReturnType<typeof useScheduleTimezone>;
