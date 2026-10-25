// (C) 2007-2026 GoodData Corporation

import { AttributeHierarchyEditingDialog } from "./AttributeHierarchyEditingDialog.js";
import { ConfirmUnsavedChangesDialog } from "./ConfirmUnsavedChangesDialog.js";
import { DeleteReportDialog } from "./DeleteReportDialog.js";
import { ExportCsvDialog } from "./ExportCsvDialog.js";
import { ExportDialog } from "./ExportDialog.js";
import { MetricEditorDialog } from "./MetricEditorDialog.js";
import { OpenReportDialog } from "./OpenReportDialog.js";
import { SaveReportDialog } from "./SaveReportDialog.js";
import { SaveReportFromKDDialog } from "./SaveReportFromKDDialog.js";

export function Dialogs() {
    return (
        <div className="dialogs-section">
            <OpenReportDialog />
            <DeleteReportDialog />
            <SaveReportDialog />
            <ExportDialog />
            <ExportCsvDialog />
            <SaveReportFromKDDialog />
            <ConfirmUnsavedChangesDialog />
            <MetricEditorDialog />
            <AttributeHierarchyEditingDialog />
        </div>
    );
}
