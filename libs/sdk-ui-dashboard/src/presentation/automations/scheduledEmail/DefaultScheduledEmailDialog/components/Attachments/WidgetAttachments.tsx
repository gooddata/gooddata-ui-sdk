// (C) 2019-2026 GoodData Corporation

import { useCallback, useRef, useState } from "react";

import { useIntl } from "react-intl";

import { type WidgetAttachmentType } from "@gooddata/sdk-model";

import { AUTOMATION_ATTACHMENTS_GROUP_LABEL_ID } from "../../../../../constants/automations.js";
import { type IScheduledEmailDialogWidgetAttachmentsProps } from "../../../types.js";

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
const ACCESSIBILITY_MODE_EXCLUDED_WIDGET_ATTACHMENTS: WidgetAttachmentType[] = ["PDF_TABULAR"];

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
    isAccessibilityModeEnabled,
    exportTemplates,
    slidesTemplateIds,
    onSlidesTemplateIdChange,
}: IScheduledEmailDialogWidgetAttachmentsProps) {
    const intl = useIntl();

    const {
        available: availableAttachments,
        visibleSelected: visibleSelectedAttachments,
        buildNextSelection,
    } = partitionAttachments({
        all: ALL_WIDGET_ATTACHMENTS,
        selected: selectedAttachments,
        excluded: [
            ...(isSlidesExportEnabled ? [] : SLIDE_WIDGET_ATTACHMENTS),
            ...(isAccessibilityModeEnabled ? ACCESSIBILITY_MODE_EXCLUDED_WIDGET_ATTACHMENTS : []),
        ],
    });
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
            .filter((attachment) => attachment.selected)
            .map((attachment) => attachment.type);
        handleWidgetAttachmentSelectionSave(buildNextSelection(formats));
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
