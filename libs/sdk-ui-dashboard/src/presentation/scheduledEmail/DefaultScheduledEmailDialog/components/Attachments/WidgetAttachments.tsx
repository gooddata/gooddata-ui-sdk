// (C) 2019-2025 GoodData Corporation

import { useCallback, useRef, useState } from "react";

import { useIntl } from "react-intl";

import {
    type IExportDefinitionVisualizationObjectSettings,
    type WidgetAttachmentType,
} from "@gooddata/sdk-model";

import { AttachmentsList } from "./AttachmentsList.js";
import { AttachmentsSelect } from "./AttachmentsSelect.js";
import { AttachmentsWrapper } from "./AttachmentsWrapper.js";
import { AUTOMATION_ATTACHMENTS_GROUP_LABEL_ID } from "../../../../constants/automations.js";

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
    const intl = useIntl();
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
                    attachment.selected && SUPPORTED_WIDGET_ATTACHMENTS.includes(attachment.type),
            )
            .map((attachment) => attachment.type);
        handleWidgetAttachmentSelectionSave(formats);
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
