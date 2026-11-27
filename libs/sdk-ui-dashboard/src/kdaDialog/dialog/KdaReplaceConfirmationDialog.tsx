// (C) 2025-2026 GoodData Corporation

import { useId, useMemo } from "react";

import { useIntl } from "react-intl";

import { ConfirmDialog, OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";

import { KDA_DIALOG_REPLACE_CONFIRMATION_OVERS_Z_INDEX } from "../const.js";

const overlayController = OverlayController.getInstance(KDA_DIALOG_REPLACE_CONFIRMATION_OVERS_Z_INDEX);

interface IKdaReplaceConfirmationDialogProps {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function KdaReplaceConfirmationDialog(props: IKdaReplaceConfirmationDialogProps) {
    const { isOpen, onCancel, onConfirm } = props;
    const intl = useIntl();
    const messageElementId = useId();

    const accessibilityConfig = useMemo(
        () => ({
            // The message describes the dialog. The dialog close button, which gets the initial
            // focus, uses the same description, so the message is read when focus enters the dialog
            // and the title is not repeated as the button's description.
            descriptionElementId: messageElementId,
        }),
        [messageElementId],
    );

    if (!isOpen) {
        return null;
    }

    return (
        <OverlayControllerProvider overlayController={overlayController}>
            <ConfirmDialog
                headline={intl.formatMessage({ id: "kdaDialog.replaceConfirmation.headline" })}
                cancelButtonText={intl.formatMessage({ id: "kdaDialog.replaceConfirmation.stay" })}
                submitButtonText={intl.formatMessage({ id: "kdaDialog.replaceConfirmation.runAnyway" })}
                isPositive={false}
                accessibilityConfig={accessibilityConfig}
                onCancel={onCancel}
                onClose={onCancel}
                onSubmit={onConfirm}
            >
                <span id={messageElementId}>
                    {intl.formatMessage({ id: "kdaDialog.replaceConfirmation.message" })}
                </span>
            </ConfirmDialog>
        </OverlayControllerProvider>
    );
}
