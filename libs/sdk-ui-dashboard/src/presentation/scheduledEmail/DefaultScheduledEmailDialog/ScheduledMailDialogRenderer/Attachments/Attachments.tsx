// (C) 2019-2022 GoodData Corporation
import * as React from "react";

import { FormattedMessage } from "react-intl";
import identity from "lodash/identity";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import { AttachmentsSelectionDropdown } from "./AttachmentsSelectionDropdown";
import { FormatOptionsDropdown } from "./FormatOptionsDropdown";
import { IWidgetExportConfiguration, IWidgetsSelection } from "../../interfaces";
import { objRefToString, ITheme } from "@gooddata/sdk-model";
import { IInsightWidgetExtended } from "../../useScheduledEmail";

export interface IAttachmentsProps {
    theme?: ITheme;
    dashboardTitle: string;
    insightWidgets: IInsightWidgetExtended[];
    dashboardSelected: boolean;
    widgetsSelected: IWidgetsSelection;
    configuration: IWidgetExportConfiguration;
    canExportReport?: boolean;
    onAttachmentsSelectionChanged(dashboardSelected: boolean, widgetsSelected: IWidgetsSelection): void;
    onAttachmentsConfigurationChanged(configuration: IWidgetExportConfiguration): void;
}

const AttachmentItem: React.FC<{ format: string }> = ({ format, children }) => (
    <div className="gd-dashboard-attachment s-gd-dashboard-attachment">
        <span className="gd-dashboard-attachment-format">{format}</span>
        <span className="gd-dashboard-attachment-name">{children}</span>
    </div>
);

const AttachmentsComponent = (props: IAttachmentsProps) => {
    const {
        dashboardTitle,
        dashboardSelected,
        widgetsSelected,
        insightWidgets = [],
        configuration,
        canExportReport,
        onAttachmentsSelectionChanged,
        onAttachmentsConfigurationChanged,
    } = props;

    const isSomeWidgetSelected = Object.values(widgetsSelected).some(identity);
    const selectedWidgetsTitles = insightWidgets
        .filter((widget) => widgetsSelected[objRefToString(widget)])
        .map((widget) => widget.title);
    return (
        <div className="gd-input-component gd-schedule-email-attachments s-schedule-email-attachments">
            <label className="gd-label">
                <FormattedMessage id="dialogs.schedule.email.attachments.label" />
            </label>
            <div className="gd-dashboard-attachment-list">
                <div className="gd-dashboard-attachment-list-content">
                    {dashboardSelected && (
                        <AttachmentItem format="pdf">
                            <span className="shortened-name">{dashboardTitle}</span>
                        </AttachmentItem>
                    )}
                    {selectedWidgetsTitles.length !== 0 && (
                        <AttachmentItem format={configuration.format}>
                            <span className="shortened-name" title={selectedWidgetsTitles.join(",\n")}>
                                {selectedWidgetsTitles.join(", ")}
                            </span>
                            {selectedWidgetsTitles.length > 1 && (
                                <span>{`(${selectedWidgetsTitles.length})`}</span>
                            )}
                        </AttachmentItem>
                    )}
                </div>
                {canExportReport && (
                    <div className="gd-schedule-email-dialog-attachments">
                        <AttachmentsSelectionDropdown
                            dashboardTitle={dashboardTitle}
                            dashboardSelected={dashboardSelected}
                            insightWidgets={insightWidgets}
                            widgetsSelected={widgetsSelected}
                            onApply={onAttachmentsSelectionChanged}
                        />
                        {isSomeWidgetSelected && (
                            <FormatOptionsDropdown
                                format={configuration.format}
                                mergeHeaders={configuration.mergeHeaders}
                                includeFilters={configuration.includeFilters}
                                onApply={onAttachmentsConfigurationChanged}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const Attachments = withTheme(AttachmentsComponent);
