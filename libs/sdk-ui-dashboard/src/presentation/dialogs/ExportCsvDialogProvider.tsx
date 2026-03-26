// (C) 2026 GoodData Corporation

import { ExportCsvDialog } from "./ExportCsvDialog.js";
import { useExportCsvDialogContext } from "../dashboardContexts/ExportCsvDialogContext.js";

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
