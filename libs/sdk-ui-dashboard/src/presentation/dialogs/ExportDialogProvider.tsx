// (C) 2021 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { ExportDialog } from "@gooddata/sdk-ui-kit";
import { useExportDialogContext } from "../dashboardContexts/index.js";

/**
 * @internal
 */
export const ExportDialogProvider: React.FC = () => {
    const { closeDialog, dialogConfig, isOpen } = useExportDialogContext();
    const intl = useIntl();
    const { onClose: originalOnClose } = dialogConfig;

    const onClose = useCallback(() => {
        originalOnClose?.();
        closeDialog();
    }, [originalOnClose, closeDialog]);

    return isOpen ? (
        <ExportDialog
            {...dialogConfig}
            headline={intl.formatMessage({ id: "dialogs.export.headline" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "dialogs.export.submit" })}
            filterContextText={intl.formatMessage({ id: "dialogs.export.includeFilters" })}
            filterContextTitle={intl.formatMessage({ id: "dialogs.export.filters" })}
            mergeHeadersText={intl.formatMessage({ id: "dialogs.export.mergeHeaders" })}
            mergeHeadersTitle={intl.formatMessage({ id: "dialogs.export.cells" })}
            onClose={onClose}
            onCancel={closeDialog}
        />
    ) : null;
};
