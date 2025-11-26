// (C) 2019-2025 GoodData Corporation

import { useRef } from "react";

import { IExportDefinitionVisualizationObjectSettings, WidgetAttachmentType } from "@gooddata/sdk-model";

import { AttachmentsList } from "./AttachmentsList.js";
import { AttachmentsSelect } from "./AttachmentsSelect.js";
import { AttachmentsWrapper } from "./AttachmentsWrapper.js";

const SUPPORTED_WIDGET_ATTACHMENTS: WidgetAttachmentType[] = [
    "PNG",
    "PPTX",
    "PDF",
    "PDF_TABULAR",
    "XLSX",
    "CSV",
    "CSV_RAW",
];

export interface IWidgetAttachmentsProps {
    selectedAttachments: WidgetAttachmentType[];
    onWidgetAttachmentsChange: (formats: WidgetAttachmentType[]) => void;
    xlsxSettings: IExportDefinitionVisualizationObjectSettings;
    onXlsxSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
}

export function WidgetAttachments({
    selectedAttachments,
    onWidgetAttachmentsChange,
    xlsxSettings,
    onXlsxSettingsChange,
}: IWidgetAttachmentsProps) {
    const attachmentListRef = useRef<HTMLDivElement>(null);

    const handleWidgetAttachmentSelectionSave = (formats: WidgetAttachmentType[]) => {
        onWidgetAttachmentsChange(formats);
    };

    const handleDelete = (attachment: WidgetAttachmentType) => {
        const newAttachments = selectedAttachments.filter((att) => att !== attachment);
        onWidgetAttachmentsChange(newAttachments);
    };

    const handleChange = (attachments: { type: WidgetAttachmentType; selected: boolean }[]) => {
        const formats = attachments
            .filter(
                (attachment): attachment is { type: WidgetAttachmentType; selected: true } =>
                    attachment.selected && SUPPORTED_WIDGET_ATTACHMENTS.includes(attachment.type),
            )
            .map((attachment) => attachment.type);
        handleWidgetAttachmentSelectionSave(formats);
        // Scroll the attachment list into view after change
        if (attachmentListRef.current) {
            setTimeout(() => {
                attachmentListRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 100);
        }
    };

    return (
        <AttachmentsWrapper key={selectedAttachments.join()}>
            <div className="gd-attachment-list" ref={attachmentListRef}>
                <AttachmentsList
                    attachments={selectedAttachments}
                    onDelete={handleDelete}
                    xlsxSettings={xlsxSettings}
                    onXlsxSettingsChange={onXlsxSettingsChange}
                    mode="widget"
                />
                <AttachmentsSelect<WidgetAttachmentType>
                    attachments={SUPPORTED_WIDGET_ATTACHMENTS.map((format) => ({
                        type: format,
                        selected: selectedAttachments.includes(format),
                    }))}
                    onChange={handleChange}
                    mode="widget"
                />
            </div>
        </AttachmentsWrapper>
    );
}
