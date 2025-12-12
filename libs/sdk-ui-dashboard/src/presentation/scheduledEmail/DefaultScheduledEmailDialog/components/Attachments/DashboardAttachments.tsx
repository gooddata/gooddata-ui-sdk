// (C) 2019-2025 GoodData Corporation

import { type ReactNode, useCallback, useRef, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import {
    type DashboardAttachmentType,
    type FilterContextItem,
    type IExportDefinitionVisualizationObjectSettings,
} from "@gooddata/sdk-model";
import { Message } from "@gooddata/sdk-ui-kit";

import { AttachmentsList } from "./AttachmentsList.js";
import { AttachmentsSelect } from "./AttachmentsSelect.js";
import { AttachmentsWrapper } from "./AttachmentsWrapper.js";
import { AUTOMATION_ATTACHMENTS_GROUP_LABEL_ID } from "../../../../constants/automations.js";

const SUPPORTED_DASHBOARD_ATTACHMENTS: DashboardAttachmentType[] = ["PDF", "PDF_SLIDES", "PPTX", "XLSX"];

export interface IDashboardAttachmentsProps {
    selectedAttachments: DashboardAttachmentType[];
    dashboardFilters?: FilterContextItem[];
    isCrossFiltering: boolean;
    onDashboardAttachmentsChange: (formats: DashboardAttachmentType[], filters?: FilterContextItem[]) => void;
    xlsxSettings: IExportDefinitionVisualizationObjectSettings;
    onXlsxSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
}

export function DashboardAttachments({
    dashboardFilters,
    isCrossFiltering,
    onDashboardAttachmentsChange,
    selectedAttachments,
    xlsxSettings,
    onXlsxSettingsChange,
}: IDashboardAttachmentsProps) {
    const intl = useIntl();
    const attachmentListRef = useRef<HTMLDivElement>(null);
    const addButtonRef = useRef<HTMLButtonElement | null>(null);
    const [announcement, setAnnouncement] = useState("");

    const handleDashboardAttachmentSelectionSave = (formats: DashboardAttachmentType[]) => {
        onDashboardAttachmentsChange(formats, dashboardFilters);
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

    const handleDelete = (attachment: DashboardAttachmentType) => {
        const newAttachments = selectedAttachments.filter((att) => att !== attachment);
        onDashboardAttachmentsChange(newAttachments, dashboardFilters);

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

    const handleChange = (attachments: { type: DashboardAttachmentType; selected: boolean }[]) => {
        const formats = attachments
            .filter(
                (attachment) =>
                    attachment.selected && SUPPORTED_DASHBOARD_ATTACHMENTS.includes(attachment.type),
            )
            .map((attachment) => attachment.type);
        handleDashboardAttachmentSelectionSave(formats);
        // Focus add button after state update causes remount (returnFocusTo ref becomes stale)
        requestAnimationFrame(() => {
            addButtonRef.current?.focus();
        });
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
                        mode="dashboard"
                    />
                    <AttachmentsSelect<DashboardAttachmentType>
                        attachments={SUPPORTED_DASHBOARD_ATTACHMENTS.map((format) => ({
                            type: format,
                            selected: selectedAttachments.includes(format),
                        }))}
                        onChange={handleChange}
                        mode="dashboard"
                        onAddButtonRef={(ref) => {
                            addButtonRef.current = ref;
                        }}
                    />
                    {isCrossFiltering && selectedAttachments.length > 0 ? (
                        <Message type="progress" className="gd-attachment-list-message">
                            <FormattedMessage
                                id="dialogs.schedule.management.attachments.message"
                                values={{
                                    strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                                }}
                            />
                        </Message>
                    ) : null}
                </div>
            </AttachmentsWrapper>
            <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
                {announcement}
            </div>
        </>
    );
}
