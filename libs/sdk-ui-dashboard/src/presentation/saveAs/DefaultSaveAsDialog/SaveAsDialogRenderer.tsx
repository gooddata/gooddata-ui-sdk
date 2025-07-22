// (C) 2020-2025 GoodData Corporation
import React, { useState, memo } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ConfirmDialog, Input, Message, Typography } from "@gooddata/sdk-ui-kit";
import compact from "lodash/compact.js";
import first from "lodash/first.js";
import noop from "lodash/noop.js";
import { IntlWrapper } from "../../localization/index.js";
import { DASHBOARD_TITLE_MAX_LENGTH } from "../../constants/index.js";
import { messages } from "../../../locales.js";

export interface ISaveAsDialogRendererOwnProps {
    dashboardTitle: string;
    isDashboardSaving: boolean;
    isDashboardLoaded: boolean;
    isKpiWidgetEnabled: boolean;
    isScheduleEmailsEnabled: boolean;
    isInEditMode: boolean;
    locale?: string;

    onSubmit: (title: string, switchToCopy?: boolean, useOriginalFilterContext?: boolean) => void;
    onCancel?: () => void;
}

/**
 * @internal
 */
export const SaveAsNewDashboardDialog = memo(function SaveAsNewDashboardDialog(
    props: ISaveAsDialogRendererOwnProps & WrappedComponentProps,
) {
    const getDefaultDashboardTitle = (): string => {
        return props.intl.formatMessage(
            { id: "dialogs.save.as.new.default.title" },
            {
                title: props.dashboardTitle,
            },
        );
    };

    const [dashboardTitle, setDashboardTitle] = useState(getDefaultDashboardTitle());

    const canCreateDashboard = (): boolean => {
        const { isDashboardLoaded, isDashboardSaving } = props;

        return isDashboardLoaded && !isDashboardSaving;
    };

    const handleTitleFocus = (e: any) => {
        e.target.select();
    };

    const handleTitleBlur = (e: any) => {
        const newDashboardTitle = e.target.value.trim();
        setDashboardTitle(newDashboardTitle === "" ? getDefaultDashboardTitle() : newDashboardTitle);
    };

    const handleTitleChange = (value: string) => {
        setDashboardTitle(value);
    };

    const onSubmit = (): void => {
        const title = dashboardTitle.trim();
        if (canCreateDashboard() && title !== "") {
            props.onSubmit(
                title,
                true, // switch to the new dashboard
                // do not reuse the filter context in edit mode, create a new one with the current filter state
                // otherwise use the original filter context values when creating a copy
                !props.isInEditMode,
            );
        }
    };

    const getNoteText = (): string => {
        const { isKpiWidgetEnabled, isScheduleEmailsEnabled, intl } = props;
        const messageId = first(
            compact([
                isKpiWidgetEnabled && isScheduleEmailsEnabled && messages.saveAsNewAlertsAndEmailsMessage.id,
                isKpiWidgetEnabled && !isScheduleEmailsEnabled && messages.saveAsNewAlertsMessage.id,
                !isKpiWidgetEnabled && isScheduleEmailsEnabled && messages.saveAsNewEmailsMessage.id,
            ]),
        );

        return messageId ? intl.formatMessage({ id: messageId }) : "";
    };

    const {
        intl: { formatMessage },
        onCancel = noop,
        isDashboardSaving,
    } = props;

    const noteText = getNoteText();

    return (
        <ConfirmDialog
            onCancel={onCancel}
            onSubmit={onSubmit}
            isPositive
            className="s-dialog save-as-new-dialog"
            headline={formatMessage({ id: "dialogs.save.as.new.title" })}
            cancelButtonText={formatMessage({ id: "cancel" })}
            submitButtonText={formatMessage({ id: "create.dashboard" })}
            isSubmitDisabled={isDashboardSaving || dashboardTitle.trim() === ""}
        >
            <Typography tagName="p" className="dashboard-note">
                {formatMessage({ id: "dialogs.save.as.new.desc" })}
            </Typography>
            <div className="dashboard-title">
                <Input
                    autofocus
                    maxlength={DASHBOARD_TITLE_MAX_LENGTH}
                    onFocus={handleTitleFocus}
                    onBlur={handleTitleBlur}
                    value={dashboardTitle}
                    placeholder={getDefaultDashboardTitle()}
                    onChange={handleTitleChange as any}
                />
            </div>
            {noteText ? <Message type="progress">{noteText}</Message> : null}
        </ConfirmDialog>
    );
});

export const SaveAsDialogRendererIntl = injectIntl(SaveAsNewDashboardDialog);

export const SaveAsDialogRenderer: React.FC<ISaveAsDialogRendererOwnProps> = (props) => (
    <IntlWrapper locale={props.locale}>
        <SaveAsDialogRendererIntl {...props} />
    </IntlWrapper>
);
