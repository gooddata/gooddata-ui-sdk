// (C) 2019-2025 GoodData Corporation
import React, { ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";
import { FilterContextItem, IAutomationMetadataObject } from "@gooddata/sdk-model";
import { Message } from "@gooddata/sdk-ui-kit";
import { AttachmentFilters, AttachmentFilterType } from "./AttachmentFilters.js";
import { getAutomationDashboardFilters } from "../../../../../_staging/automation/index.js";
import { AttachmentDashboard } from "./AttachmentItems.js";
import { IAttachmentFilterInfo } from "../../hooks/useFiltersForDashboardScheduledExportInfo.js";

export interface IDashboardAttachmentsProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
    dashboardSelected: boolean;
    areDashboardFiltersChanged: boolean;
    dashboardFilters?: FilterContextItem[];
    isCrossFiltering: boolean;
    filtersToDisplayInfo: IAttachmentFilterInfo[];
    onDashboardAttachmentsSelectionChange: (
        dashboardSelected: boolean,
        filters?: FilterContextItem[],
    ) => void;
}

export const DashboardAttachments = (props: IDashboardAttachmentsProps) => {
    const {
        dashboardSelected,
        scheduledExportToEdit,
        areDashboardFiltersChanged,
        dashboardFilters,
        isCrossFiltering,
        filtersToDisplayInfo,
        onDashboardAttachmentsSelectionChange,
    } = props;

    /**
     * When editing a schedule, we need to get the filters from the export definition and we don't care
     * about the actual filters on the dashboard.
     */
    const savedFilters = getAutomationDashboardFilters(scheduledExportToEdit);

    const isEditing = !!scheduledExportToEdit;

    const [attachmentFilterType, setAttachmentFilterType] = useState<AttachmentFilterType>(
        /**
         * We use "edited" by default when creating a new schedule or editing
         * an existing schedule with filters.
         * "default" is used when editing without filters.
         */
        !isEditing || savedFilters ? "edited" : "default",
    );

    const showAttachmentFilters = isEditing
        ? attachmentFilterType !== "default"
        : areDashboardFiltersChanged && dashboardSelected;

    const includeFilters = attachmentFilterType === "edited" && areDashboardFiltersChanged;

    const handleAttachmentFilterTypeChange = (type: AttachmentFilterType) => {
        const includeFilters = type === "edited" && areDashboardFiltersChanged;
        setAttachmentFilterType(type);
        onDashboardAttachmentsSelectionChange(
            dashboardSelected,
            includeFilters ? dashboardFilters : undefined,
        );
    };

    const handleDashboardAttachmentSelectionChange = () => {
        onDashboardAttachmentsSelectionChange(
            !dashboardSelected,
            includeFilters ? dashboardFilters : undefined,
        );
    };

    const accessibilityValue = "form.attachments";

    return (
        <div className="gd-input-component gd-notifications-channels-attachments s-notifications-channels-attachments">
            <label htmlFor={accessibilityValue} className="gd-label">
                <FormattedMessage id="dialogs.schedule.email.attachments.label" />
            </label>
            <div className="gd-attachment-list">
                <AttachmentDashboard
                    id={accessibilityValue}
                    disabled
                    pdfSelected={dashboardSelected}
                    onSelectionChange={handleDashboardAttachmentSelectionChange}
                />
                <AttachmentFilters
                    filterType={attachmentFilterType}
                    onChange={handleAttachmentFilterTypeChange}
                    hidden={!showAttachmentFilters}
                    disabled={isEditing}
                    filters={filtersToDisplayInfo}
                />
                {isCrossFiltering && dashboardSelected ? (
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
        </div>
    );
};
