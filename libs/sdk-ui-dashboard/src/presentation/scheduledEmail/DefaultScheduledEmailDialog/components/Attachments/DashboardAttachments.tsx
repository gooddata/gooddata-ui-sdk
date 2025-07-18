// (C) 2019-2025 GoodData Corporation
import { ReactNode, useRef } from "react";
import {
    DashboardAttachmentType,
    FilterContextItem,
    IExportDefinitionVisualizationObjectSettings,
} from "@gooddata/sdk-model";
import { AttachmentsWrapper } from "./AttachmentsWrapper.js";
import { AttachmentsSelect } from "./AttachmentsSelect.js";
import { AttachmentsList } from "./AttachmentsList.js";
import { FormattedMessage } from "react-intl";
import { Message } from "@gooddata/sdk-ui-kit";

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
    const attachmentListRef = useRef<HTMLDivElement>(null);

    const handleDashboardAttachmentSelectionSave = (formats: DashboardAttachmentType[]) => {
        onDashboardAttachmentsChange(formats, dashboardFilters);
    };

    const handleDelete = (attachment: DashboardAttachmentType) => {
        const newAttachments = selectedAttachments.filter((att) => att !== attachment);
        onDashboardAttachmentsChange(newAttachments, dashboardFilters);
    };

    const handleChange = (attachments: { type: DashboardAttachmentType; selected: boolean }[]) => {
        const formats = attachments
            .filter(
                (attachment) =>
                    attachment.selected && SUPPORTED_DASHBOARD_ATTACHMENTS.includes(attachment.type),
            )
            .map((attachment) => attachment.type);
        handleDashboardAttachmentSelectionSave(formats);
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
                    mode="dashboard"
                />
                <AttachmentsSelect<DashboardAttachmentType>
                    attachments={SUPPORTED_DASHBOARD_ATTACHMENTS.map((format) => ({
                        type: format,
                        selected: selectedAttachments.includes(format),
                    }))}
                    onChange={handleChange}
                    mode="dashboard"
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
    );
}
