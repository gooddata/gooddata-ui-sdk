// (C) 2019-2024 GoodData Corporation
import React, { ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
    FilterContextItem,
    IAutomationMetadataObject,
    IExportDefinitionSettings,
    IWidget,
} from "@gooddata/sdk-model";
import { Message } from "@gooddata/sdk-ui-kit";
import { AttachmentFilters, AttachmentFilterType } from "./AttachmentFilters.js";
import { useAttachmentDashboardFilters } from "../../hooks/useAttachmentDashboardFilters.js";
import { getAutomationDashboardFilters } from "../../utils/automationHelpers.js";
import { AttachmentDashboard, AttachmentWidgets } from "./AttachmentItems.js";
import { WidgetAttachmentType } from "../../types.js";
// import { WidgetAttachmentType } from "../../../types.js";

export interface IAttachmentsProps {
    dashboardTitle: string;
    dashboardSelected: boolean;
    csvSelected: boolean;
    xlsxSelected: boolean;
    settings: IExportDefinitionSettings;
    onDashboardAttachmentsSelectionChange: (
        dashboardSelected: boolean,
        filters?: FilterContextItem[],
    ) => void;
    onWidgetAttachmentsSelectionChange: (
        selected: boolean,
        format: WidgetAttachmentType,
        filters?: FilterContextItem[],
    ) => void;
    onWidgetAttachmentsSettingsChange: (obj: IExportDefinitionSettings) => void;
    widget?: IWidget;
    editSchedule?: IAutomationMetadataObject;
}

export const Attachments = (props: IAttachmentsProps) => {
    const {
        dashboardTitle,
        dashboardSelected,
        csvSelected,
        xlsxSelected,
        settings,
        onDashboardAttachmentsSelectionChange,
        onWidgetAttachmentsSelectionChange,
        onWidgetAttachmentsSettingsChange,
        widget,
        editSchedule,
    } = props;

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
    const includeFilters = attachmentFilterType === "edited" && areFiltersChanged;

    const handleAttachmentFilterTypeChange = (type: AttachmentFilterType) => {
        const includeFilters = type === "edited" && areFiltersChanged;
        setAttachmentFilterType(type);
        onDashboardAttachmentsSelectionChange(dashboardSelected, includeFilters ? filtersToStore : undefined);
    };

    const handleDashboardAttachmentSelectionChange = () => {
        onDashboardAttachmentsSelectionChange(
            !dashboardSelected,
            includeFilters ? filtersToStore : undefined,
        );
    };

    const handleWidgetAttachmentSelectionChange = (format: WidgetAttachmentType) => {
        if (format === "CSV") {
            onWidgetAttachmentsSelectionChange(
                !csvSelected,
                format,
                includeFilters ? filtersToStore : undefined,
            );
        } else {
            onWidgetAttachmentsSelectionChange(
                !xlsxSelected,
                format,
                includeFilters ? filtersToStore : undefined,
            );
        }
    };

    return (
        <div className="gd-input-component gd-schedule-email-attachments s-schedule-email-attachments">
            <label className="gd-label">
                <FormattedMessage id="dialogs.schedule.email.attachments.label" />
            </label>
            <div className="gd-attachment-list">
                {widget ? (
                    <AttachmentWidgets
                        csvSelected={csvSelected}
                        xlsxSelected={xlsxSelected}
                        settings={settings}
                        onSelectionChange={handleWidgetAttachmentSelectionChange}
                        onSettingsChange={onWidgetAttachmentsSettingsChange}
                    />
                ) : (
                    <AttachmentDashboard
                        title={dashboardTitle}
                        pdfSelected={dashboardSelected}
                        onSelectionChange={handleDashboardAttachmentSelectionChange}
                    />
                )}
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
