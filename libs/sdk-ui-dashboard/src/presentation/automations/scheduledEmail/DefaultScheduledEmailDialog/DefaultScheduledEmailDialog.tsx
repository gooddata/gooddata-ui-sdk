// (C) 2019-2026 GoodData Corporation

import { type ReactElement } from "react";

import { ContentDivider } from "@gooddata/sdk-ui-kit";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";
import { DefaultLoadingScheduledEmailDialog } from "../blocks/DefaultLoadingScheduledEmailDialog.js";
import { ScheduledEmailDialogDashboardAttachments } from "../blocks/ScheduledEmailDialogDashboardAttachments.js";
import { ScheduledEmailDialogEvaluationMode } from "../blocks/ScheduledEmailDialogEvaluationMode.js";
import { ScheduledEmailDialogMessage } from "../blocks/ScheduledEmailDialogMessage.js";
import { ScheduledEmailDialogRecurrence } from "../blocks/ScheduledEmailDialogRecurrence.js";
import { ScheduledEmailDialogShell } from "../blocks/ScheduledEmailDialogShell.js";
import { ScheduledEmailDialogSubject } from "../blocks/ScheduledEmailDialogSubject.js";
import { ScheduledEmailDialogWidgetAttachments } from "../blocks/ScheduledEmailDialogWidgetAttachments.js";
import { useScheduledExportDraft } from "../state/ScheduledExportDraftContext.js";
import { useSaveScheduledEmailToBackend } from "../state/useSaveScheduledEmailToBackend.js";
import {
    useScheduledEmailDialogDestinationProps,
    useScheduledEmailDialogRecipientsProps,
    useScheduledEmailDialogTimezoneProps,
} from "../state/useScheduledEmailDialogRegionProps.js";
import { useScheduledEmailSubmitOnEnter } from "../state/useScheduledEmailSubmitOnEnter.js";
import { type IDefaultScheduledEmailDialogProps } from "../types.js";

import { DefaultScheduledEmailDialogDestination } from "./components/DefaultScheduledEmailDialogDestination.js";
import { DefaultScheduledEmailDialogRecipients } from "./components/DefaultScheduledEmailDialogRecipients.js";
import { DefaultScheduledEmailDialogTimezone } from "./components/DefaultScheduledEmailDialogTimezone.js";

/**
 * Default implementation of the scheduled export create/edit dialog.
 *
 * This component is a pure consumer of `AutomationsContext`, `ScheduledEmailDialogContext`, and the
 * scheduled export dialog state contexts: it reads org/workspace data, per-dialog state, and the
 * export draft's state from those contexts rather than from the dashboard store. It must therefore
 * be rendered within an `AutomationsContextProvider`, a `ScheduledEmailDialogContextProvider` (for
 * the create/edit flow), and a `ScheduledEmailDialogStateProvider`, whose state model establishes
 * itself once `useScheduledEmailDialogContext().isLoading` is false. Inside a `Dashboard`, the
 * scheduled export connector supplies the first two providers above the
 * `ScheduledEmailDialogComponent` slot and mounts `ScheduledEmailDialogStateProvider` around the
 * resolved slot component — so the default component, and any wholesale slot replacement, inherit
 * all three contexts automatically and require no extra wiring.
 *
 * The providers are intentionally hoisted above the slot rather than built inside this component:
 * that is what lets a wholesale replacement receive the same contexts. Rendering this component
 * outside those providers throws at runtime.
 *
 * The dialog is {@link ScheduledEmailDialogShell} — the chrome: overlay, frame, header row, action bar, the
 * General/Filters tabs, the body's messages, the stale-filters and delete confirmation steps, the loading
 * skeleton — around the exported region renders ({@link DefaultScheduledEmailDialogDestination},
 * {@link DefaultScheduledEmailDialogRecipients}, {@link DefaultScheduledEmailDialogTimezone}, fed by
 * {@link useScheduledEmailDialogDestinationProps} and siblings; the header, action bar and the Filters tab's
 * {@link DefaultScheduledEmailDialogFilters} are the shell's) and the General-tab field blocks
 * ({@link ScheduledEmailDialogRecurrence}, {@link ScheduledEmailDialogSubject}, {@link ScheduledEmailDialogMessage},
 * {@link ScheduledEmailDialogWidgetAttachments}, {@link ScheduledEmailDialogDashboardAttachments},
 * {@link ScheduledEmailDialogEvaluationMode}). A custom `ScheduledEmailDialogComponent` that keeps this chrome
 * but owns the arrangement renders {@link ScheduledEmailDialogShell} around the blocks it wants (see its
 * example); one that owns the chrome too places the blocks ({@link ScheduledEmailDialogFilters} and
 * siblings) in its own markup and reads or writes the same draft through {@link useScheduledExportDraft}
 * and {@link useScheduledExportActions}.
 *
 * Slots render only in the fully rendered dialog: not while the dialog context reports loading,
 * and not while the stale-filters confirmation step is shown. The Filters slot additionally
 * renders only while the Filters tab is selected — see {@link IScheduledEmailDialogSlots.Filters}.
 *
 * @alpha
 */
export function DefaultScheduledEmailDialog(props: IDefaultScheduledEmailDialogProps): ReactElement {
    const { onCancel } = props;
    const { locale } = useAutomationsContext();
    const { isLoading, scheduledExportToEdit } = useScheduledEmailDialogContext();
    if (isLoading) {
        return (
            <DefaultLoadingScheduledEmailDialog
                onCancel={onCancel}
                scheduledExportToEdit={scheduledExportToEdit}
            />
        );
    }
    return (
        <IntlWrapper locale={locale}>
            <DefaultScheduledEmailDialogBody {...props} />
        </IntlWrapper>
    );
}

function DefaultScheduledEmailDialogBody({
    onBack,
    onCancel,
    onDeleteSuccess,
    onDeleteError,
    onError,
    onSave,
    onSaveError,
    onSaveSuccess,
    onSubmit,
    onSuccess,
    slots,
    topContent,
    bottomContent,
}: IDefaultScheduledEmailDialogProps): ReactElement {
    const TimezoneSlot = slots?.Timezone;
    const DestinationSlot = slots?.Destination;
    const RecipientsSlot = slots?.Recipients;

    const { canSelectScheduleTimezone } = useScheduledExportDraft();

    const { handleSaveScheduledEmail, isSavingScheduledEmail, savingErrorMessage } =
        useSaveScheduledEmailToBackend({ onSuccess, onError, onSubmit, onSaveSuccess, onSaveError, onSave });

    const handleSubmitForm = useScheduledEmailSubmitOnEnter({
        onSubmit: handleSaveScheduledEmail,
        isSaving: isSavingScheduledEmail,
    });

    const destinationDefaultProps = useScheduledEmailDialogDestinationProps();
    const recipientsDefaultProps = useScheduledEmailDialogRecipientsProps({
        onKeyDownSubmit: handleSubmitForm,
    });
    const timezoneDefaultProps = useScheduledEmailDialogTimezoneProps();

    return (
        <ScheduledEmailDialogShell
            onBack={onBack}
            onCancel={onCancel}
            onDeleteSuccess={onDeleteSuccess}
            onDeleteError={onDeleteError}
            onSubmit={handleSaveScheduledEmail}
            isSaving={isSavingScheduledEmail}
            savingErrorMessage={savingErrorMessage}
            slots={slots}
            topContent={topContent}
            bottomContent={bottomContent}
        >
            <ScheduledEmailDialogRecurrence onKeyDownSubmit={handleSubmitForm} />
            <ContentDivider className="gd-divider-with-margin" />
            {DestinationSlot ? (
                <DestinationSlot
                    Default={DefaultScheduledEmailDialogDestination}
                    defaultProps={destinationDefaultProps}
                />
            ) : (
                <DefaultScheduledEmailDialogDestination {...destinationDefaultProps} />
            )}
            <ContentDivider className="gd-divider-with-margin" />
            {RecipientsSlot ? (
                <RecipientsSlot
                    Default={DefaultScheduledEmailDialogRecipients}
                    defaultProps={recipientsDefaultProps}
                />
            ) : (
                <DefaultScheduledEmailDialogRecipients {...recipientsDefaultProps} />
            )}
            <ScheduledEmailDialogSubject onKeyDownSubmit={handleSaveScheduledEmail} />
            <ScheduledEmailDialogMessage />
            <ScheduledEmailDialogWidgetAttachments />
            <ScheduledEmailDialogDashboardAttachments />
            {canSelectScheduleTimezone ? (
                TimezoneSlot ? (
                    <TimezoneSlot
                        Default={DefaultScheduledEmailDialogTimezone}
                        defaultProps={timezoneDefaultProps}
                    />
                ) : (
                    <DefaultScheduledEmailDialogTimezone {...timezoneDefaultProps} />
                )
            ) : null}
            <ScheduledEmailDialogEvaluationMode />
        </ScheduledEmailDialogShell>
    );
}
