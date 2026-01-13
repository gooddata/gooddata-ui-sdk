// (C) 2025 GoodData Corporation

import { type ReactNode } from "react";

import { useIntl } from "react-intl";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

import {
    BULK_DELETE_CONFIRM_DIALOG_ID,
    BULK_PAUSE_CONFIRM_DIALOG_ID,
    BULK_RESUME_CONFIRM_DIALOG_ID,
    BULK_UNSUBSCRIBE_CONFIRM_DIALOG_ID,
    DELETE_CONFIRM_DIALOG_ID,
    PAUSE_CONFIRM_DIALOG_ID,
    RESUME_CONFIRM_DIALOG_ID,
    UNSUBSCRIBE_CONFIRM_DIALOG_ID,
} from "./constants.js";
import { messages } from "./messages.js";
import { type IAutomationsPendingAction } from "./types.js";

interface IAutomationConfirmDialogProps {
    pendingAction: IAutomationsPendingAction | null | undefined;
    setPendingAction: (action: IAutomationsPendingAction | null | undefined) => void;
}

export function AutomationConfirmDialog({ pendingAction, setPendingAction }: IAutomationConfirmDialogProps) {
    const intl = useIntl();

    if (!pendingAction) {
        return null;
    }

    const { type, automationsType, automationTitle } = pendingAction;
    const capitalizedAutomationsType = automationsType === "schedule" ? "Schedule" : "Alert";

    const getHeadline = () => {
        switch (type) {
            case "delete":
                return intl.formatMessage(
                    messages[`confirmDialogDelete${capitalizedAutomationsType}Headline`],
                );
            case "unsubscribe":
                return intl.formatMessage(
                    messages[`confirmDialogUnsubscribe${capitalizedAutomationsType}Headline`],
                );
            case "pause":
                return intl.formatMessage(
                    messages[`confirmDialogPause${capitalizedAutomationsType}Headline`],
                );
            case "resume":
                return intl.formatMessage(
                    messages[`confirmDialogResume${capitalizedAutomationsType}Headline`],
                );
            case "bulkDelete":
                return intl.formatMessage(
                    messages[`confirmDialogBulkDelete${capitalizedAutomationsType}Headline`],
                );
            case "bulkUnsubscribe":
                return intl.formatMessage(
                    messages[`confirmDialogBulkUnsubscribe${capitalizedAutomationsType}Headline`],
                );
            case "bulkPause":
                return intl.formatMessage(
                    messages[`confirmDialogBulkPause${capitalizedAutomationsType}Headline`],
                );
            case "bulkResume":
                return intl.formatMessage(
                    messages[`confirmDialogBulkResume${capitalizedAutomationsType}Headline`],
                );
            default:
                return "";
        }
    };

    const getContent = () => {
        switch (type) {
            case "delete":
                return intl.formatMessage(
                    messages[`confirmDialogDelete${capitalizedAutomationsType}Content`],
                    {
                        title: automationTitle,
                        b: (chunks: ReactNode) => <b>{chunks}</b>,
                    },
                );
            case "unsubscribe":
                return intl.formatMessage(
                    messages[`confirmDialogUnsubscribe${capitalizedAutomationsType}Content`],
                    {
                        title: automationTitle,
                        b: (chunks: ReactNode) => <b>{chunks}</b>,
                    },
                );
            case "pause":
                return intl.formatMessage(
                    messages[`confirmDialogPause${capitalizedAutomationsType}Content`],
                    {
                        title: automationTitle,
                        b: (chunks: ReactNode) => <b>{chunks}</b>,
                    },
                );
            case "resume":
                return intl.formatMessage(
                    messages[`confirmDialogResume${capitalizedAutomationsType}Content`],
                    {
                        title: automationTitle,
                        b: (chunks: ReactNode) => <b>{chunks}</b>,
                    },
                );
            case "bulkDelete":
                return intl.formatMessage(
                    messages[`confirmDialogBulkDelete${capitalizedAutomationsType}Content`],
                );
            case "bulkUnsubscribe":
                return intl.formatMessage(
                    messages[`confirmDialogBulkUnsubscribe${capitalizedAutomationsType}Content`],
                );
            case "bulkPause":
                return intl.formatMessage(
                    messages[`confirmDialogBulkPause${capitalizedAutomationsType}Content`],
                );
            case "bulkResume":
                return intl.formatMessage(
                    messages[`confirmDialogBulkResume${capitalizedAutomationsType}Content`],
                );
            default:
                return "";
        }
    };

    const getSubmitButtonText = () => {
        if (pendingAction.type === "delete" || pendingAction.type === "bulkDelete") {
            return intl.formatMessage(messages.confirmDialogButtonDelete);
        }
        return intl.formatMessage(messages.confirmDialogButtonConfirm);
    };

    const getDialogId = () => {
        switch (type) {
            case "delete":
                return DELETE_CONFIRM_DIALOG_ID;
            case "unsubscribe":
                return UNSUBSCRIBE_CONFIRM_DIALOG_ID;
            case "pause":
                return PAUSE_CONFIRM_DIALOG_ID;
            case "resume":
                return RESUME_CONFIRM_DIALOG_ID;
            case "bulkDelete":
                return BULK_DELETE_CONFIRM_DIALOG_ID;
            case "bulkUnsubscribe":
                return BULK_UNSUBSCRIBE_CONFIRM_DIALOG_ID;
            case "bulkPause":
                return BULK_PAUSE_CONFIRM_DIALOG_ID;
            case "bulkResume":
                return BULK_RESUME_CONFIRM_DIALOG_ID;
            default:
                return undefined;
        }
    };

    const handleSubmit = () => {
        setPendingAction(undefined);
        pendingAction?.onConfirm();
    };

    const handleClose = () => {
        setPendingAction(undefined);
    };

    return (
        <ConfirmDialog
            displayCloseButton
            isPositive={false}
            headline={getHeadline()}
            cancelButtonText={intl.formatMessage(messages.confirmDialogButtonCancel)}
            submitButtonText={getSubmitButtonText()}
            onSubmit={handleSubmit}
            onClose={handleClose}
            onCancel={handleClose}
            className="automations-confirm-dialog"
            containerClassName="automations-confirm-dialog-overlay"
            accessibilityConfig={{
                dialogId: getDialogId(),
            }}
        >
            {getContent()}
        </ConfirmDialog>
    );
}
