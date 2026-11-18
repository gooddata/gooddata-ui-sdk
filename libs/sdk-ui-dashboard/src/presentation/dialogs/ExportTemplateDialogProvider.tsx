// (C) 2026 GoodData Corporation

import { UiReturnFocusOnUnmount } from "@gooddata/sdk-ui-kit";

import { useExportTemplateDialogContext } from "../dashboardContexts/ExportTemplateDialogContext.js";

import { ExportTemplateSelectionDialog } from "./ExportTemplateSelectionDialog/ExportTemplateSelectionDialog.js";

/**
 * @internal
 */
export function ExportTemplateDialogProvider() {
    const { isOpen, dialogConfig, closeDialog } = useExportTemplateDialogContext();

    if (!isOpen || !dialogConfig) {
        return null;
    }

    return (
        <UiReturnFocusOnUnmount returnFocusTo={dialogConfig.returnFocusTo}>
            <ExportTemplateSelectionDialog
                templates={dialogConfig.templates}
                onConfirm={(templateId) => {
                    closeDialog();
                    dialogConfig.onConfirm(templateId);
                }}
                onCancel={() => {
                    closeDialog();
                    dialogConfig.onCancel?.();
                }}
            />
        </UiReturnFocusOnUnmount>
    );
}
