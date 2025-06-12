// (C) 2022-2025 GoodData Corporation

import React, { ReactNode } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { ConfirmDialog, Message } from "@gooddata/sdk-ui-kit";

interface IApplyCurrentFiltersConfirmDialogProps {
    automationType: "alert" | "schedule";
    onCancel: () => void;
    onEdit: () => void;
}

const messages = defineMessages({
    title: { id: "dialogs.automation.applyCurrentFilters.confirm.title" },
    submit: { id: "dialogs.automation.applyCurrentFilters.confirm.submit" },
    alertText: { id: "dialogs.automation.applyCurrentFilters.alert.confirm" },
    scheduleText: { id: "dialogs.automation.applyCurrentFilters.schedule.confirm" },
});

export const ApplyCurrentFiltersConfirmDialog: React.FC<IApplyCurrentFiltersConfirmDialogProps> = (props) => {
    const { automationType, onCancel, onEdit } = props;
    const intl = useIntl();

    return (
        <ConfirmDialog
            displayCloseButton={true}
            isPositive={true}
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
                    id={automationType === "alert" ? messages.alertText.id : messages.scheduleText.id}
                    values={{
                        b: (chunks: ReactNode) => <strong>{chunks}</strong>,
                    }}
                />
            </Message>
        </ConfirmDialog>
    );
};
