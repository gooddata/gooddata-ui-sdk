// (C) 2024 GoodData Corporation

import React, { ReactNode } from "react";
import { ConfirmDialog } from "@gooddata/sdk-ui-kit";
import { FormattedMessage, useIntl } from "react-intl";

export const AlertDeleteDialog: React.FC<{ title: string; onDelete: () => void; onCancel: () => void }> = ({
    title,
    onDelete,
    onCancel,
}) => {
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
};
