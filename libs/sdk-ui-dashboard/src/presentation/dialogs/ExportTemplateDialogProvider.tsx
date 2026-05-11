// (C) 2026 GoodData Corporation

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
    );
}
