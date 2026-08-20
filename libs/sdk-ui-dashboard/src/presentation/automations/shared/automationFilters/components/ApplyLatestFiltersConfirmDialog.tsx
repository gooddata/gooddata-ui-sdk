// (C) 2022-2026 GoodData Corporation

import { type ReactNode } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { ConfirmDialog, Message } from "@gooddata/sdk-ui-kit";

interface IApplyCurrentFiltersConfirmDialogProps {
    automationType: "alert" | "schedule";
    /**
     * Whether the stored schedule timezone no longer matches the dashboard; picks the
     * timezone-specific warning wording (schedules only). When both filters and the timezone
     * diverged, the combined wording is used.
     */
    timezoneChanged?: boolean;
    /**
     * Whether the stored filters/parameters no longer match the dashboard. Defaults to true so
     * existing callers keep the filters wording.
     */
    filtersChanged?: boolean;
    onCancel: () => void;
    onEdit: () => void;
}

const messages = defineMessages({
    title: { id: "dialogs.automation.applyCurrentFilters.confirm.title" },
    submit: { id: "dialogs.automation.applyCurrentFilters.confirm.submit" },
    alertText: { id: "dialogs.automation.applyCurrentFilters.alert.confirm" },
    scheduleText: { id: "dialogs.automation.applyCurrentFilters.schedule.confirm" },
    scheduleTimezoneText: { id: "dialogs.automation.applyCurrentFilters.schedule.timezone.confirm" },
    scheduleFiltersAndTimezoneText: {
        id: "dialogs.automation.applyCurrentFilters.schedule.filtersAndTimezone.confirm",
    },
});

function getScheduleMessageId(filtersChanged: boolean, timezoneChanged: boolean): string {
    if (filtersChanged && timezoneChanged) {
        return messages.scheduleFiltersAndTimezoneText.id;
    }
    if (timezoneChanged) {
        return messages.scheduleTimezoneText.id;
    }
    return messages.scheduleText.id;
}

export function ApplyCurrentFiltersConfirmDialog({
    automationType,
    timezoneChanged = false,
    filtersChanged = true,
    onCancel,
    onEdit,
}: IApplyCurrentFiltersConfirmDialogProps) {
    const intl = useIntl();

    return (
        <ConfirmDialog
            displayCloseButton
            isPositive
            headline={intl.formatMessage(messages.title)}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage(messages.submit)}
            onSubmit={onEdit}
            onClose={onCancel}
            onCancel={onCancel}
            className="s-automation-apply-current-filters-dialog"
        >
            <Message type="warning">
                <FormattedMessage
                    id={
                        automationType === "alert"
                            ? messages.alertText.id
                            : getScheduleMessageId(filtersChanged, timezoneChanged)
                    }
                    values={{
                        b: (chunks: ReactNode) => <strong>{chunks}</strong>,
                    }}
                />
            </Message>
        </ConfirmDialog>
    );
}
