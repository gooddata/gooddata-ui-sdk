// (C) 2019-2025 GoodData Corporation

import { ReactNode } from "react";

import { FormattedMessage } from "react-intl";

import {
    IAutomationMetadataObject,
    IExportDefinitionVisualizationObjectSettings,
    IFilter,
} from "@gooddata/sdk-model";
import { Message, OverlayPositionType } from "@gooddata/sdk-ui-kit";

import { AttachmentWidgets } from "./AttachmentItems.js";
import { AttachmentsWrapper } from "./AttachmentsWrapper.js";
import { OldWidgetAttachmentType } from "../../types.js";

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
        format: OldWidgetAttachmentType,
        filters?: IFilter[],
    ) => void;
    onAttachmentsSettingsChange: (obj: IExportDefinitionVisualizationObjectSettings) => void;
    enableAutomationFilterContext?: boolean;
    closeOnParentScroll?: boolean;
    overlayPositionType?: OverlayPositionType;
}

export function WidgetAttachments({
    widgetFilters,
    areDashboardFiltersChanged,
    isCrossFiltering,
    csvSelected,
    xlsxSelected,
    settings,
    scheduledExportToEdit,
    onWidgetAttachmentsSelectionChange,
    onAttachmentsSettingsChange,
    enableAutomationFilterContext,
    closeOnParentScroll,
    overlayPositionType,
}: IWidgetAttachmentsProps) {
    const renderFiltersMessage = !enableAutomationFilterContext;
    const isEditing = !!scheduledExportToEdit;

    const handleWidgetAttachmentSelectionChange = (format: OldWidgetAttachmentType) => {
        if (format === "CSV") {
            onWidgetAttachmentsSelectionChange(!csvSelected, format, widgetFilters);
        } else {
            onWidgetAttachmentsSelectionChange(!xlsxSelected, format, widgetFilters);
        }
    };

    return (
        <AttachmentsWrapper>
            <div className="gd-attachment-list-old">
                <AttachmentWidgets
                    csvSelected={csvSelected}
                    xlsxSelected={xlsxSelected}
                    settings={settings}
                    onSelectionChange={handleWidgetAttachmentSelectionChange}
                    onSettingsChange={onAttachmentsSettingsChange}
                    closeOnParentScroll={closeOnParentScroll}
                    overlayPositionType={overlayPositionType}
                />
                {renderFiltersMessage &&
                (isEditing || areDashboardFiltersChanged) &&
                (csvSelected || xlsxSelected) ? (
                    <div className="s-scheduled-email-attachments-filters-message">
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
        </AttachmentsWrapper>
    );
}
