// (C) 2026 GoodData Corporation

import { DefaultScheduledEmailDialogTimezone } from "../DefaultScheduledEmailDialog/components/DefaultScheduledEmailDialogTimezone.js";
import { useScheduledExportDraft } from "../state/ScheduledExportDraftContext.js";
import { useScheduledEmailDialogTimezoneProps } from "../state/useScheduledEmailDialogRegionProps.js";
import { type ScheduledEmailDialogTimezoneDefaultProps } from "../types.js";

import { WhenScheduledEmailDialogLoaded } from "./WhenScheduledEmailDialogLoaded.js";

/**
 * The scheduled-export dialog's "Time zone" section (the export-content timezone picker), connected
 * to the dialog's state.
 *
 * Renders {@link DefaultScheduledEmailDialogTimezone} with the props of
 * {@link useScheduledEmailDialogTimezoneProps}; every prop passed here replaces the hook's value
 * wholesale. Renders nothing while `useScheduledEmailDialogContext().isLoading` is true, and nothing
 * when `useScheduledExportDraft().canSelectScheduleTimezone` is false — the schedule may not define
 * its own timezone then, exactly as in the default dialog.
 *
 * @alpha
 */
export function ScheduledEmailDialogTimezone(overrides: Partial<ScheduledEmailDialogTimezoneDefaultProps>) {
    return (
        <WhenScheduledEmailDialogLoaded>
            <ConnectedScheduledEmailDialogTimezone {...overrides} />
        </WhenScheduledEmailDialogLoaded>
    );
}

function ConnectedScheduledEmailDialogTimezone(overrides: Partial<ScheduledEmailDialogTimezoneDefaultProps>) {
    const { canSelectScheduleTimezone } = useScheduledExportDraft();
    const defaultProps = useScheduledEmailDialogTimezoneProps();
    return canSelectScheduleTimezone ? (
        <DefaultScheduledEmailDialogTimezone {...defaultProps} {...overrides} />
    ) : null;
}
