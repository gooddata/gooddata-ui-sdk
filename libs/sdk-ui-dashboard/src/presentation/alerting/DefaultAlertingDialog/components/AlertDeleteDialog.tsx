// (C) 2024-2025 GoodData Corporation

import { ReactNode } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

export function AlertDeleteDialog({
    title,
    onDelete,
    onCancel,
}: {
    title: string;
    onDelete: () => void;
    onCancel: () => void;
}) {
    const intl = useIntl();

    return (
        <ConfirmDialog
            displayCloseButton={true}
            isPositive={false}
            headline={intl.formatMessage({ id: "insightAlert.config.delete.title" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "delete" })}
            onSubmit={onDelete}
            onClose={onCancel}
            onCancel={onCancel}
        >
            <FormattedMessage
                id="insightAlert.config.delete.message"
                values={{
                    title,
                    b: (chunks: ReactNode) => <strong>{chunks}</strong>,
                }}
            />
        </ConfirmDialog>
    );
}
