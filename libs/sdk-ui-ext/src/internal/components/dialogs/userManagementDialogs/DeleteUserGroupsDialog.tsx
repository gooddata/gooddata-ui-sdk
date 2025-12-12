// (C) 2023-2025 GoodData Corporation

import { type ReactNode, useState } from "react";

import { useIntl } from "react-intl";

import { useBackendStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";
import { messages } from "./locales.js";
import { type IWithTelemetryProps, useTelemetry, withTelemetry } from "./TelemetryContext.js";

/**
 * @internal
 */
export interface IDeleteUserGroupsDialogProps extends IWithTelemetryProps {
    userGroupIds: string[];
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

function DeleteUserGroupsDialogComponent({
    userGroupIds,
    organizationId,
    onSuccess,
    onClose,
}: IDeleteUserGroupsDialogProps) {
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
            .deleteUserGroups(userGroupIds)
            .then(() => {
                addSuccess(messages.userGroupsDeleteSuccess);
                trackEvent("multiple-groups-deleted");
                onSuccess();
                onClose();
            })
            .catch((error) => {
                console.error("Delete of user groups failed", error);
                addError(messages.userGroupsDeleteFailure);
            })
            .finally(() => setIsProcessing(false));
    };

    return (
        <DeleteConfirmDialog
            titleText={intl.formatMessage(messages.deleteUserGroupsConfirmTitle)}
            bodyText={intl.formatMessage(messages.deleteUserGroupsConfirmBody, {
                b: (chunks: ReactNode) => <b>{chunks}</b>,
                br: <br />,
                count: userGroupIds.length,
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
export const DeleteUserGroupsDialog = withTelemetry(DeleteUserGroupsDialogComponent);
