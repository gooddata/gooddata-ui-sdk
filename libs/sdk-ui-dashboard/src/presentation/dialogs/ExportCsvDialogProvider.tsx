// (C) 2026 GoodData Corporation

import { UiReturnFocusOnUnmount } from "@gooddata/sdk-ui-kit";

import { useExportCsvDialogContext } from "../dashboardContexts/ExportCsvDialogContext.js";

import { ExportCsvDialog } from "./ExportCsvDialog.js";

/**
 * @internal
 */
export function ExportCsvDialogProvider() {
    const { closeDialog, dialogConfig, isOpen, returnFocusTo } = useExportCsvDialogContext();

    return isOpen && dialogConfig ? (
        <UiReturnFocusOnUnmount returnFocusTo={returnFocusTo}>
            <ExportCsvDialog
                onCancel={closeDialog}
                onSubmit={(data) => {
                    closeDialog();
                    dialogConfig.onSubmit(data);
                }}
            />
        </UiReturnFocusOnUnmount>
    ) : null;
}
