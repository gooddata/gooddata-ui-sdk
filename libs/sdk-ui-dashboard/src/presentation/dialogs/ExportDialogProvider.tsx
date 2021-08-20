// (C) 2021 GoodData Corporation
import { ExportDialog } from "@gooddata/sdk-ui-kit";
import React, { useCallback } from "react";
import { useExportDialogContext } from "../dashboardContexts";

/**
 * @internal
 */
export const ExportDialogProvider: React.FC = () => {
    const { closeDialog, dialogConfig, isOpen } = useExportDialogContext();
    const { onClose: originalOnClose } = dialogConfig;

    const onClose = useCallback(() => {
        originalOnClose?.();
        closeDialog();
    }, [originalOnClose, closeDialog]);

    return isOpen ? <ExportDialog {...dialogConfig} onClose={onClose} onCancel={closeDialog} /> : null;
};
