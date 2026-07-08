// (C) 2026 GoodData Corporation

import { useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type IExportTemplate, isIdentifierRef } from "@gooddata/sdk-model";
import { ConfirmDialog, UiTooltip } from "@gooddata/sdk-ui-kit";

const messages = defineMessages({
    dialogTitle: { id: "export.template.dialog.title" },
    exportButton: { id: "export.template.dialog.export" },
    cancelButton: { id: "cancel" },
});

const templateId = (template: IExportTemplate): string =>
    isIdentifierRef(template.ref) ? template.ref.identifier : "";

interface IExportTemplateSelectionDialogProps {
    templates: IExportTemplate[];
    onConfirm: (templateId: string) => void;
    onCancel: () => void;
}

export function ExportTemplateSelectionDialog({
    templates,
    onConfirm,
    onCancel,
}: IExportTemplateSelectionDialogProps) {
    const intl = useIntl();
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
        templates[0] ? templateId(templates[0]) : "",
    );

    const handleSubmit = () => {
        onConfirm(selectedTemplateId);
    };

    return (
        <ConfirmDialog
            className="gd-export-template-selection-dialog s-export-template-selection-dialog"
            isPositive
            displayCloseButton
            headline={intl.formatMessage(messages.dialogTitle)}
            cancelButtonText={intl.formatMessage(messages.cancelButton)}
            submitButtonText={intl.formatMessage(messages.exportButton)}
            onCancel={onCancel}
            onClose={onCancel}
            onSubmit={handleSubmit}
        >
            <div
                className="gd-export-template-list"
                role="radiogroup"
                aria-label={intl.formatMessage(messages.dialogTitle)}
            >
                {templates.map((template) => {
                    const id = templateId(template);
                    return (
                        <UiTooltip
                            key={id}
                            triggerBy={["hover", "focus"]}
                            arrowPlacement="bottom"
                            content={template.name}
                            anchor={
                                <label className="gd-export-template-item input-radio-label s-export-template-item">
                                    <input
                                        type="radio"
                                        className="input-radio"
                                        name="exportTemplate"
                                        value={id}
                                        checked={selectedTemplateId === id}
                                        onChange={() => setSelectedTemplateId(id)}
                                    />
                                    <span className="input-label-text">{template.name}</span>
                                </label>
                            }
                        />
                    );
                })}
            </div>
        </ConfirmDialog>
    );
}
