// (C) 2023 GoodData Corporation

import React, { ReactNode, useState } from "react";
import { useIntl } from "react-intl";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { messages } from "./locales.js";
import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";

/**
 * @internal
 */
export interface IDeleteUsersDialogProps {
    userIds: string[];
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

/**
 * @internal
 */
export const DeleteUsersDialog: React.FC<IDeleteUsersDialogProps> = ({
    userIds,
    organizationId,
    onSuccess,
    onClose,
}) => {
    const intl = useIntl();
    const backend = useBackendStrict();
    const { addSuccess, addError } = useToastMessage();
    const [isProcessing, setIsProcessing] = useState(false);

    const onConfirm = () => {
        setIsProcessing(true);
        backend
            .organization(organizationId)
            .users()
            .deleteUsers(userIds)
            .then(() => {
                addSuccess(messages.usersDeleteSuccess);
                onSuccess();
                onClose();
            })
            .catch((error) => {
                console.error("Delete of users failed", error);
                addError(messages.usersDeletedFailure);
            })
            .finally(() => setIsProcessing(false));
    };

    return (
        <DeleteConfirmDialog
            titleText={intl.formatMessage(messages.deleteUsersConfirmTitle)}
            bodyText={intl.formatMessage(messages.deleteUsersConfirmBody, {
                b: (chunks: ReactNode) => <b>{chunks}</b>,
                count: userIds.length,
            })}
            isProcessing={isProcessing}
            onConfirm={onConfirm}
            onCancel={onClose}
        />
    );
};
