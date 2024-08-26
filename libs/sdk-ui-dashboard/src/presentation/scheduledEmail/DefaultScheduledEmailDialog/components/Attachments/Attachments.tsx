// (C) 2019-2024 GoodData Corporation
import React, { ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
    FilterContextItem,
    IAutomationMetadataObject,
    IExportDefinitionVisualizationObjectSettings,
} from "@gooddata/sdk-model";
import { Message } from "@gooddata/sdk-ui-kit";
import { AttachmentFilters, AttachmentFilterType } from "./AttachmentFilters.js";
import { useAttachmentDashboardFilters } from "../../hooks/useAttachmentDashboardFilters.js";
import { getAutomationDashboardFilters } from "../../utils/automationHelpers.js";
import { AttachmentDashboard, AttachmentWidgets } from "./AttachmentItems.js";
import { WidgetAttachmentType } from "../../types.js";
import { ExtendedDashboardWidget } from "src/model/index.js";

export interface IAttachmentsProps {
    dashboardTitle: string;
    dashboardSelected: boolean;
    csvSelected: boolean;
    xlsxSelected: boolean;
    settings: IExportDefinitionVisualizationObjectSettings;
    onDashboardAttachmentsSelectionChange: (
        dashboardSelected: boolean,
        filters?: FilterContextItem[],
    ) => void;
    onWidgetAttachmentsSelectionChange: (
        selected: boolean,
        format: WidgetAttachmentType,
        filters?: FilterContextItem[],
    ) => void;
    onWidgetAttachmentsSettingsChange: (obj: IExportDefinitionVisualizationObjectSettings) => void;
    widget?: ExtendedDashboardWidget;
    editSchedule?: IAutomationMetadataObject;
}

export const Attachments = (props: IAttachmentsProps) => {
    const {
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
            widget,
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
    const attachmentSelected = dashboardSelected || csvSelected || xlsxSelected;
    const showAttachmentFilters = isEditing
        ? attachmentFilterType !== "default"
        : areFiltersChanged && attachmentSelected;
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
            onWidgetAttachmentsSelectionChange(!csvSelected, format, filtersToStore);
        } else {
            onWidgetAttachmentsSelectionChange(!xlsxSelected, format, filtersToStore);
        }
    };

    return (
        <div className="gd-input-component gd-notifications-channels-attachments s-notifications-channels-attachments">
            <label className="gd-label">
                <FormattedMessage id="dialogs.schedule.email.attachments.label" />
            </label>
            <div className="gd-attachment-list">
                {widget ? (
                    <>
                        <AttachmentWidgets
                            csvSelected={csvSelected}
                            xlsxSelected={xlsxSelected}
                            settings={settings}
                            onSelectionChange={handleWidgetAttachmentSelectionChange}
                            onSettingsChange={onWidgetAttachmentsSettingsChange}
                        />
                        {(isEditing || areFiltersChanged) && (csvSelected || xlsxSelected) ? (
                            <div>
                                <FormattedMessage id="dialogs.schedule.management.attachments.filters.using" />{" "}
                                <FormattedMessage id="dialogs.schedule.management.attachments.filters.edited" />
                            </div>
                        ) : null}
                    </>
                ) : (
                    <>
                        <AttachmentDashboard
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
                    </>
                )}
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
