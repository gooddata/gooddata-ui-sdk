// (C) 2022 GoodData Corporation

import * as React from "react";
import { useCallback, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import identity from "lodash/identity.js";
import { Icon, InsightIcon, Typography } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { ObjRef, objRefToString } from "@gooddata/sdk-model";

import { IWidgetsSelection } from "../../interfaces.js";
import { IInsightWidgetExtended } from "../../useScheduledEmail.js";
import { ScheduleDropdown } from "./ScheduleDropdown.js";

export interface IAttachmentsSelectionDropdownProps {
    dashboardTitle: string;
    dashboardSelected: boolean;
    insightWidgets: IInsightWidgetExtended[];
    widgetsSelected: { [widgetUri: string]: boolean };
    onApply(dashboardSelected: boolean, widgetsSelected: IWidgetsSelection): void;
}

export const AttachmentsSelectionDropdown: React.FC<IAttachmentsSelectionDropdownProps> = (props) => {
    const { dashboardTitle, insightWidgets = [], onApply } = props;
    const intl = useIntl();
    const theme = useTheme();
    const ICON_COLOR = theme?.palette?.complementary?.c5;
    const ICON_SIZE_BUTTON = 18;
    const ICON_PROPS = { color: ICON_COLOR, height: 19, width: 26 };

    const [dashboardSelected, setDashboardSelected] = useState(props.dashboardSelected);
    const [widgetsSelected, setWidgetsSelected] = useState(props.widgetsSelected);

    const handleWidgetSelectedChange = useCallback(
        (widgetRef: ObjRef) => {
            const widgetRefKey = objRefToString(widgetRef);
            setWidgetsSelected({
                ...widgetsSelected,
                [widgetRefKey]: !widgetsSelected[widgetRefKey],
            });
        },
        [widgetsSelected],
    );

    const handleOnApply = useCallback(() => {
        onApply(dashboardSelected, widgetsSelected);
    }, [onApply, dashboardSelected, widgetsSelected]);
    const handleOnCancel = useCallback(() => {
        setDashboardSelected(props.dashboardSelected);
        setWidgetsSelected(props.widgetsSelected);
    }, [props.dashboardSelected, props.widgetsSelected]);

    const canApply =
        (dashboardSelected || Object.values(widgetsSelected).some(identity)) &&
        (dashboardSelected != props.dashboardSelected ||
            JSON.stringify(widgetsSelected) !== JSON.stringify(props.widgetsSelected));

    return (
        <ScheduleDropdown
            title={intl.formatMessage({ id: "dialogs.schedule.email.attachment.select" })}
            applyDisabled={!canApply}
            onApply={handleOnApply}
            onCancel={handleOnCancel}
            buttonClassName="s-schedule-select-attachments-button"
            bodyClassName="s-schedule-select-attachments-body"
            buttonDisabled={insightWidgets.length === 0}
            iconComponent={
                <Icon.AttachmentClip color={ICON_COLOR} width={ICON_SIZE_BUTTON} height={ICON_SIZE_BUTTON} />
            }
            contentComponent={
                <div className="gd-attachments-selection-dropdown">
                    <Typography tagName="h3">
                        <FormattedMessage id="dialogs.schedule.email.attachment.select.dashboard.header" />
                    </Typography>
                    <div>
                        <label className="input-checkbox-label s-schedule-dashboard-attachment-label">
                            <input
                                type="checkbox"
                                className="input-checkbox"
                                checked={dashboardSelected}
                                onChange={(event) => setDashboardSelected(event.target.checked)}
                            />
                            <Icon.Dashboard {...ICON_PROPS} />
                            <span title={dashboardTitle} className="input-label-text">
                                {dashboardTitle}
                            </span>
                        </label>
                    </div>
                    <Typography tagName="h3">
                        <FormattedMessage id="dialogs.schedule.email.attachment.select.widgets.header" />
                    </Typography>
                    {insightWidgets.map((widget) => (
                        <div key={objRefToString(widget)}>
                            <label className="input-checkbox-label s-schedule-widget-attachment-label">
                                <input
                                    type="checkbox"
                                    className="input-checkbox"
                                    checked={widgetsSelected[objRefToString(widget)]}
                                    onChange={() => handleWidgetSelectedChange(widget)}
                                />
                                <InsightIcon
                                    visualizationUrl={widget.visualizationUrl}
                                    iconProps={ICON_PROPS}
                                />
                                <span title={widget.title} className="input-label-text">
                                    {widget.title}
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            }
        />
    );
};
