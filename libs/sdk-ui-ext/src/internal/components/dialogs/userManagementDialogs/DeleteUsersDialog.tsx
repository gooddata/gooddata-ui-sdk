// (C) 2023-2025 GoodData Corporation

import { ReactNode, useState } from "react";

import { useIntl } from "react-intl";

import { useBackendStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";
import { messages } from "./locales.js";
import { IWithTelemetryProps, useTelemetry, withTelemetry } from "./TelemetryContext.js";

/**
 * @internal
 */
export interface IDeleteUsersDialogProps extends IWithTelemetryProps {
    userIds: string[];
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

function DeleteUsersDialogComponent({
    userIds,
    organizationId,
    onSuccess,
    onClose,
}: IDeleteUsersDialogProps) {
    const intl = useIntl();
    const backend = useBackendStrict();
    const { addSuccess, addError } = useToastMessage();
    const [isProcessing, setIsProcessing] = useState(false);
    const trackEvent = useTelemetry();

    const onConfirm = () => {
        setIsProcessing(true);
        backend
            .organization(organizationId)
            .users()
            .deleteUsers(userIds)
            .then(() => {
                addSuccess(messages.usersDeleteSuccess);
                trackEvent("multiple-users-deleted");
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
}

/**
 * @internal
 */
export const DeleteUsersDialog = withTelemetry(DeleteUsersDialogComponent);
