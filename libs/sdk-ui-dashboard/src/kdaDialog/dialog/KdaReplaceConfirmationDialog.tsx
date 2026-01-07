// (C) 2025-2026 GoodData Corporation

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
                onCancel={onCancel}
                onClose={onCancel}
                onSubmit={onConfirm}
            >
                {intl.formatMessage({ id: "kdaDialog.replaceConfirmation.message" })}
            </ConfirmDialog>
        </OverlayControllerProvider>
    );
}
