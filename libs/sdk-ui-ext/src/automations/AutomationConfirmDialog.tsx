// (C) 2025 GoodData Corporation
import React, { ReactNode } from "react";

import { useIntl } from "react-intl";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

import { messages } from "./messages.js";
import { IAutomationsPendingAction } from "./types.js";

interface IAutomationConfirmDialogProps {
    pendingAction: IAutomationsPendingAction | null;
    setPendingAction: (action: IAutomationsPendingAction | null) => void;
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
            case "bulkDelete":
                return intl.formatMessage(
                    messages[`confirmDialogBulkDelete${capitalizedAutomationsType}Headline`],
                );
            case "bulkUnsubscribe":
                return intl.formatMessage(
                    messages[`confirmDialogBulkUnsubscribe${capitalizedAutomationsType}Headline`],
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
            case "bulkDelete":
                return intl.formatMessage(
                    messages[`confirmDialogBulkDelete${capitalizedAutomationsType}Content`],
                );
            case "bulkUnsubscribe":
                return intl.formatMessage(
                    messages[`confirmDialogBulkUnsubscribe${capitalizedAutomationsType}Content`],
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

    const handleSubmit = () => {
        setPendingAction(undefined);
        pendingAction?.onConfirm();
    };

    const handleClose = () => {
        setPendingAction(undefined);
    };

    return (
        <ConfirmDialog
            displayCloseButton={true}
            isPositive={false}
            headline={getHeadline()}
            cancelButtonText={intl.formatMessage(messages.confirmDialogButtonCancel)}
            submitButtonText={getSubmitButtonText()}
            onSubmit={handleSubmit}
            onClose={handleClose}
            onCancel={handleClose}
            className="automations-confirm-dialog"
            containerClassName="automations-confirm-dialog-overlay"
        >
            {getContent()}
        </ConfirmDialog>
    );
}
