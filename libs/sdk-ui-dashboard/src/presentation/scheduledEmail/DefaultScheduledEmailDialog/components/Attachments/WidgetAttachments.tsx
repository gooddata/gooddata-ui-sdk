// (C) 2019-2024 GoodData Corporation
import React, { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import {
    IAutomationMetadataObject,
    IExportDefinitionVisualizationObjectSettings,
    IFilter,
} from "@gooddata/sdk-model";
import { Message } from "@gooddata/sdk-ui-kit";
import { AttachmentWidgets } from "./AttachmentItems.js";
import { WidgetAttachmentType } from "../../types.js";

export interface IWidgetAttachmentsProps {
    widgetFilters?: IFilter[];
    areDashboardFiltersChanged: boolean;
    isCrossFiltering: boolean;
    scheduledExportToEdit?: IAutomationMetadataObject;
    csvSelected: boolean;
    xlsxSelected: boolean;
    settings: IExportDefinitionVisualizationObjectSettings;
    onWidgetAttachmentsSelectionChange: (
        selected: boolean,
        format: WidgetAttachmentType,
        filters?: IFilter[],
    ) => void;
    onWidgetAttachmentsSettingsChange: (obj: IExportDefinitionVisualizationObjectSettings) => void;
}

export const WidgetAttachments = (props: IWidgetAttachmentsProps) => {
    const {
        widgetFilters,
        areDashboardFiltersChanged,
        isCrossFiltering,
        csvSelected,
        xlsxSelected,
        settings,
        scheduledExportToEdit,
        onWidgetAttachmentsSelectionChange,
        onWidgetAttachmentsSettingsChange,
    } = props;

    const isEditing = !!scheduledExportToEdit;

    const handleWidgetAttachmentSelectionChange = (format: WidgetAttachmentType) => {
        if (format === "CSV") {
            onWidgetAttachmentsSelectionChange(!csvSelected, format, widgetFilters);
        } else {
            onWidgetAttachmentsSelectionChange(!xlsxSelected, format, widgetFilters);
        }
    };

    return (
        <div className="gd-input-component gd-notifications-channels-attachments s-notifications-channels-attachments">
            <label className="gd-label">
                <FormattedMessage id="dialogs.schedule.email.attachments.label" />
            </label>
            <div className="gd-attachment-list">
                <AttachmentWidgets
                    csvSelected={csvSelected}
                    xlsxSelected={xlsxSelected}
                    settings={settings}
                    onSelectionChange={handleWidgetAttachmentSelectionChange}
                    onSettingsChange={onWidgetAttachmentsSettingsChange}
                />
                {(isEditing || areDashboardFiltersChanged) && (csvSelected || xlsxSelected) ? (
                    <div>
                        <FormattedMessage id="dialogs.schedule.management.attachments.filters.using" />{" "}
                        <FormattedMessage id="dialogs.schedule.management.attachments.filters.edited" />
                    </div>
                ) : null}
                {isCrossFiltering ? (
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
