// (C) 2026 GoodData Corporation

import { useExportTemplates } from "../../../model/react/useExportTemplates.js";
import { useExportTemplateDialogContext } from "../../dashboardContexts/ExportTemplateDialogContext.js";

/**
 * Returns a function that resolves the export template before triggering an export.
 *
 * - When 0-1 custom templates exist (or feature flag is off): exports immediately with no template (backend default).
 * - When multiple custom templates exist: opens a selection dialog, then exports with the chosen template.
 *
 * Templates are prefetched by the useExportTemplates hook. The backend caching layer
 * ensures repeated calls don't hit the API again.
 *
 * @internal
 */
export const useExportWithTemplateSelection = () => {
    const templates = useExportTemplates();
    const { openDialog } = useExportTemplateDialogContext();

    return (exportFn: (templateId?: string) => void, onCancel?: () => void) => {
        if (templates.length <= 1) {
            // 0-1 templates: export immediately, let backend use default
            exportFn(undefined);
        } else {
            openDialog({ templates, onConfirm: exportFn, onCancel });
        }
    };
};
