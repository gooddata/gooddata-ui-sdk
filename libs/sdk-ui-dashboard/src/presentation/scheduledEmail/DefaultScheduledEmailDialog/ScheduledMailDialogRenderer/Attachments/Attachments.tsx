// (C) 2019-2022 GoodData Corporation
import * as React from "react";
import { FormattedMessage } from "react-intl";
import identity from "lodash/identity.js";
import { objRefToString } from "@gooddata/sdk-model";

import { AttachmentsSelectionDropdown } from "./AttachmentsSelectionDropdown.js";
import { FormatOptionsDropdown } from "./FormatOptionsDropdown.js";
import { IWidgetExportConfiguration, IWidgetsSelection } from "../../interfaces.js";
import { IInsightWidgetExtended } from "../../useScheduledEmail.js";

export interface IAttachmentsProps {
    dashboardTitle: string;
    insightWidgets: IInsightWidgetExtended[];
    dashboardSelected: boolean;
    widgetsSelected: IWidgetsSelection;
    configuration: IWidgetExportConfiguration;
    canExportTabular?: boolean;
    onAttachmentsSelectionChanged(dashboardSelected: boolean, widgetsSelected: IWidgetsSelection): void;
    onAttachmentsConfigurationChanged(configuration: IWidgetExportConfiguration): void;
}

const AttachmentItem: React.FC<{ format: string; children?: React.ReactNode }> = ({ format, children }) => (
    <div aria-label="dashboard-attachment" className="gd-dashboard-attachment s-gd-dashboard-attachment">
        <span className="gd-dashboard-attachment-format">{format}</span>
        <span className="gd-dashboard-attachment-name">{children}</span>
    </div>
);

export const Attachments = (props: IAttachmentsProps) => {
    const {
        dashboardTitle,
        dashboardSelected,
        widgetsSelected,
        insightWidgets = [],
        configuration,
        canExportTabular,
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
                    {dashboardSelected ? (
                        <AttachmentItem format="pdf">
                            <span className="shortened-name">{dashboardTitle}</span>
                        </AttachmentItem>
                    ) : null}
                    {selectedWidgetsTitles.length !== 0 ? (
                        <AttachmentItem format={configuration.format}>
                            <span className="shortened-name" title={selectedWidgetsTitles.join(",\n")}>
                                {selectedWidgetsTitles.join(", ")}
                            </span>
                            {selectedWidgetsTitles.length > 1 ? (
                                <span>{`(${selectedWidgetsTitles.length})`}</span>
                            ) : null}
                        </AttachmentItem>
                    ) : null}
                </div>
                {canExportTabular ? (
                    <div className="gd-schedule-email-dialog-attachments">
                        <AttachmentsSelectionDropdown
                            dashboardTitle={dashboardTitle}
                            dashboardSelected={dashboardSelected}
                            insightWidgets={insightWidgets}
                            widgetsSelected={widgetsSelected}
                            onApply={onAttachmentsSelectionChanged}
                        />
                        {isSomeWidgetSelected ? (
                            <FormatOptionsDropdown
                                format={configuration.format}
                                mergeHeaders={configuration.mergeHeaders}
                                includeFilters={configuration.includeFilters}
                                onApply={onAttachmentsConfigurationChanged}
                            />
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
};
