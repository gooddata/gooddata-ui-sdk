// (C) 2019-2024 GoodData Corporation
import React, { ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";
import { FilterContextItem, IAutomationMetadataObject } from "@gooddata/sdk-model";
import { Message } from "@gooddata/sdk-ui-kit";
import { AttachmentFilters, AttachmentFilterType } from "./AttachmentFilters.js";
import { useAttachmentDashboardFilters } from "../../hooks/useAttachmentDashboardFilters.js";
import { getAutomationDashboardFilters } from "../../utils/getAutomationFilters.js";

export interface IAttachmentsProps {
    dashboardTitle: string;
    dashboardSelected: boolean;
    onAttachmentsSelectionChanged(dashboardSelected: boolean, filters?: FilterContextItem[]): void;
    editSchedule?: IAutomationMetadataObject;
}

const AttachmentItem: React.FC<{ format: string; children?: React.ReactNode }> = ({ format, children }) => (
    <div aria-label="dashboard-attachment" className="gd-dashboard-attachment s-gd-dashboard-attachment">
        <span className="gd-dashboard-attachment-format">{format}</span>
        <span className="gd-dashboard-attachment-name">{children}</span>
    </div>
);

export const Attachments = (props: IAttachmentsProps) => {
    const { dashboardTitle, dashboardSelected, onAttachmentsSelectionChanged, editSchedule } = props;

    /**
     * When editing a schedule, we need to get the filters from the export definition and we don't care
     * about the actual filters on the dashboard.
     */
    const dashboardEditFilters = getAutomationDashboardFilters(editSchedule);
    const { areFiltersChanged, isCrossFiltering, filtersToStore, filtersToDisplayInfo } =
        useAttachmentDashboardFilters({
            customFilters: dashboardEditFilters,
        });
    const isEditing = !!editSchedule;

    const [attachmentFilterType, setAttachmentFilterType] = useState<AttachmentFilterType>(
        /**
         * We use "edited" by default when creating a new schedule or editing
         * an existing schedule with filters.
         * "default" is used when editing without filters.
         */
        !isEditing || dashboardEditFilters ? "edited" : "default",
    );
    const showAttachmentFilters = isEditing || (areFiltersChanged && dashboardSelected);
    const disableDropdown = isEditing && attachmentFilterType === "default";

    const handleAttachmentFilterTypeChange = (type: AttachmentFilterType) => {
        const includeFilters = type === "edited" && areFiltersChanged;
        setAttachmentFilterType(type);
        onAttachmentsSelectionChanged(dashboardSelected, includeFilters ? filtersToStore : undefined);
    };

    const handleAttachmentSelectionChange = () => {
        const includeFilters = attachmentFilterType === "edited" && areFiltersChanged;
        onAttachmentsSelectionChanged(!dashboardSelected, includeFilters ? filtersToStore : undefined);
    };

    return (
        <div className="gd-input-component gd-schedule-email-attachments s-schedule-email-attachments">
            <label className="gd-label">
                <FormattedMessage id="dialogs.schedule.email.attachments.label" />
            </label>
            <div className="gd-attachment-list">
                <label className="gd-schedule-mail-attachment-checkbox input-checkbox-label">
                    <input
                        type="checkbox"
                        className="input-checkbox"
                        checked={props.dashboardSelected}
                        onChange={handleAttachmentSelectionChange}
                    />
                    <span className="input-label-text" />
                    <AttachmentItem format="pdf">
                        <span className="shortened-name">{dashboardTitle}</span>
                    </AttachmentItem>
                </label>
                <AttachmentFilters
                    filterType={attachmentFilterType}
                    onChange={handleAttachmentFilterTypeChange}
                    hidden={!showAttachmentFilters}
                    disabled={isEditing}
                    useDropdown={!disableDropdown}
                    filters={filtersToDisplayInfo}
                />
                {isCrossFiltering && props.dashboardSelected ? (
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
