// (C) 2019-2026 GoodData Corporation

import { useCallback, useRef, useState } from "react";

import { useIntl } from "react-intl";

import {
    type IExportDefinitionVisualizationObjectSettings,
    type IExportTemplate,
    type WidgetAttachmentType,
} from "@gooddata/sdk-model";

import { AUTOMATION_ATTACHMENTS_GROUP_LABEL_ID } from "../../../../../constants/automations.js";

import { partitionAttachments } from "./attachmentFormats.js";
import { AttachmentsList } from "./AttachmentsList.js";
import { AttachmentsSelect } from "./AttachmentsSelect.js";
import { AttachmentsWrapper } from "./AttachmentsWrapper.js";

const ALL_WIDGET_ATTACHMENTS: WidgetAttachmentType[] = [
    "PNG",
    "PPTX",
    "PDF",
    "PDF_TABULAR",
    "XLSX",
    "CSV",
    "CSV_RAW",
];
const SLIDE_WIDGET_ATTACHMENTS: WidgetAttachmentType[] = ["PDF", "PPTX"];

export interface IWidgetAttachmentsProps {
    selectedAttachments: WidgetAttachmentType[];
    onWidgetAttachmentsChange: (formats: WidgetAttachmentType[]) => void;
    xlsxSettings: IExportDefinitionVisualizationObjectSettings;
    onXlsxSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    pdfSettings: IExportDefinitionVisualizationObjectSettings;
    onPdfSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    csvSettings: IExportDefinitionVisualizationObjectSettings;
    onCsvSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    csvRawSettings: IExportDefinitionVisualizationObjectSettings;
    onCsvRawSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    isSlidesExportEnabled: boolean;
    defaultPdfPageSize?: IExportDefinitionVisualizationObjectSettings["pageSize"];
    exportTemplates?: IExportTemplate[];
    slidesTemplateIds?: { PPTX?: string; PDF_SLIDES?: string; PDF?: string };
    onSlidesTemplateIdChange?: (
        templateId: string | undefined,
        format: "PPTX" | "PDF_SLIDES" | "PDF",
    ) => void;
}

export function WidgetAttachments({
    selectedAttachments,
    onWidgetAttachmentsChange,
    xlsxSettings,
    onXlsxSettingsChange,
    pdfSettings,
    onPdfSettingsChange,
    csvSettings,
    onCsvSettingsChange,
    csvRawSettings,
    onCsvRawSettingsChange,
    isSlidesExportEnabled,
    defaultPdfPageSize,
    exportTemplates,
    slidesTemplateIds,
    onSlidesTemplateIdChange,
}: IWidgetAttachmentsProps) {
    const intl = useIntl();

    const {
        available: availableAttachments,
        visibleSelected: visibleSelectedAttachments,
        hiddenSelected: hiddenSelectedFormats,
    } = partitionAttachments(
        ALL_WIDGET_ATTACHMENTS,
        SLIDE_WIDGET_ATTACHMENTS,
        selectedAttachments,
        isSlidesExportEnabled,
    );
    const attachmentListRef = useRef<HTMLDivElement>(null);
    const addButtonRef = useRef<HTMLButtonElement | null>(null);
    const [announcement, setAnnouncement] = useState("");

    const handleWidgetAttachmentSelectionSave = (formats: WidgetAttachmentType[]) => {
        onWidgetAttachmentsChange(formats);
    };

    const focusAttachmentGroup = useCallback(() => {
        requestAnimationFrame(() => {
            if (attachmentListRef.current) {
                attachmentListRef.current.tabIndex = 0;
                attachmentListRef.current.focus();
            }
        });
    }, []);

    const makeAttachmentGroupUnfocusable = useCallback(() => {
        requestAnimationFrame(() => {
            if (attachmentListRef.current) {
                attachmentListRef.current.removeAttribute("tabindex");
            }
        });
    }, []);

    const handleDelete = (attachment: WidgetAttachmentType) => {
        const newAttachments = selectedAttachments.filter((att) => att !== attachment);
        onWidgetAttachmentsChange(newAttachments);

        setTimeout(() => {
            setAnnouncement(
                intl.formatMessage(
                    { id: "dialogs.schedule.management.attachments.removed" },
                    { format: attachment },
                ),
            );
        });

        // Focus management: if items remain, focus the group; otherwise focus add button
        if (newAttachments.length > 0) {
            focusAttachmentGroup();
        } else {
            requestAnimationFrame(() => {
                addButtonRef.current?.focus();
            });
        }
    };

    const handleChange = (attachments: { type: WidgetAttachmentType; selected: boolean }[]) => {
        const formats = attachments
            .filter(
                (attachment): attachment is { type: WidgetAttachmentType; selected: true } =>
                    attachment.selected && availableAttachments.includes(attachment.type),
            )
            .map((attachment) => attachment.type);
        handleWidgetAttachmentSelectionSave([...formats, ...hiddenSelectedFormats]);
        // Focus add button after state update causes remount (returnFocusTo ref becomes stale)
        requestAnimationFrame(() => {
            addButtonRef.current?.focus();
        });
        // Scroll the attachment list into view after change
        if (attachmentListRef.current) {
            setTimeout(() => {
                attachmentListRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 100);
        }
    };

    return (
        <>
            <AttachmentsWrapper key={selectedAttachments.join()}>
                <div
                    className="gd-attachment-list"
                    role="group"
                    aria-labelledby={AUTOMATION_ATTACHMENTS_GROUP_LABEL_ID}
                    ref={attachmentListRef}
                    onBlur={makeAttachmentGroupUnfocusable}
                >
                    <AttachmentsList
                        attachments={visibleSelectedAttachments}
                        onDelete={handleDelete}
                        xlsxSettings={xlsxSettings}
                        onXlsxSettingsChange={onXlsxSettingsChange}
                        pdfSettings={pdfSettings}
                        onPdfSettingsChange={onPdfSettingsChange}
                        csvSettings={csvSettings}
                        onCsvSettingsChange={onCsvSettingsChange}
                        csvRawSettings={csvRawSettings}
                        onCsvRawSettingsChange={onCsvRawSettingsChange}
                        defaultPdfPageSize={defaultPdfPageSize}
                        mode="widget"
                        exportTemplates={exportTemplates}
                        slidesTemplateIds={slidesTemplateIds}
                        onSlidesTemplateIdChange={onSlidesTemplateIdChange}
                    />
                    <AttachmentsSelect<WidgetAttachmentType>
                        attachments={availableAttachments.map((format) => ({
                            type: format,
                            selected: selectedAttachments.includes(format),
                        }))}
                        onChange={handleChange}
                        mode="widget"
                        onAddButtonRef={(ref) => {
                            addButtonRef.current = ref;
                        }}
                    />
                </div>
            </AttachmentsWrapper>
            <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
                {announcement}
            </div>
        </>
    );
}
