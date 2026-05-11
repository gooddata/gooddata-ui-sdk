// (C) 2026 GoodData Corporation

import { useExportCsvDialogContext } from "../dashboardContexts/ExportCsvDialogContext.js";

import { ExportCsvDialog } from "./ExportCsvDialog.js";

/**
 * @internal
 */
export function ExportCsvDialogProvider() {
    const { closeDialog, dialogConfig, isOpen } = useExportCsvDialogContext();

    return isOpen && dialogConfig ? (
        <ExportCsvDialog
            initialDelimiter={dialogConfig.initialDelimiter}
            onCancel={closeDialog}
            onSubmit={(data) => {
                closeDialog();
                dialogConfig.onSubmit(data);
            }}
        />
    ) : null;
}
