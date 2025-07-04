// (C) 2019-2025 GoodData Corporation
import React, { useRef } from "react";
import { IExportDefinitionVisualizationObjectSettings, WidgetAttachmentType } from "@gooddata/sdk-model";
import { AttachmentsWrapper } from "./AttachmentsWrapper.js";
import { AttachmentsSelect } from "./AttachmentsSelect.js";
import { AttachmentsList } from "./AttachmentsList.js";

const SUPPORTED_WIDGET_ATTACHMENTS: WidgetAttachmentType[] = ["PNG", "PPTX", "PDF", "XLSX", "CSV"];

export interface IWidgetAttachmentsProps {
    selectedAttachments: WidgetAttachmentType[];
    onWidgetAttachmentsChange: (formats: WidgetAttachmentType[]) => void;
    xlsxSettings: IExportDefinitionVisualizationObjectSettings;
    onXlsxSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
}

export const WidgetAttachments = ({
    selectedAttachments,
    onWidgetAttachmentsChange,
    xlsxSettings,
    onXlsxSettingsChange,
}: IWidgetAttachmentsProps) => {
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
                    key={selectedAttachments.join()}
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
};
