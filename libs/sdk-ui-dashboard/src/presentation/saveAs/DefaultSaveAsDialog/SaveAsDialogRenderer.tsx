// (C) 2020-2025 GoodData Corporation

import { FocusEvent, memo, useCallback, useState } from "react";

import { compact } from "lodash-es";
import { useIntl } from "react-intl";

import { ConfirmDialog, Input, Message, Typography } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";
import { DASHBOARD_TITLE_MAX_LENGTH } from "../../constants/index.js";
import { IntlWrapper } from "../../localization/index.js";

export interface ISaveAsDialogRendererOwnProps {
    dashboardTitle: string;
    isDashboardSaving: boolean;
    isDashboardLoaded: boolean;
    isKpiWidgetEnabled: boolean;
    isInEditMode: boolean;
    locale?: string;

    onSubmit: (title: string, switchToCopy?: boolean, useOriginalFilterContext?: boolean) => void;
    onCancel?: () => void;
}

/**
 * @internal
 */
export const SaveAsNewDashboardDialog = memo(function SaveAsNewDashboardDialog({
    onCancel = () => {},
    isDashboardLoaded,
    isDashboardSaving,
    dashboardTitle: dashboardTitleProp,
    onSubmit,
    isInEditMode,
    isKpiWidgetEnabled,
}: ISaveAsDialogRendererOwnProps) {
    const intl = useIntl();

    const getDefaultDashboardTitle = useCallback(() => {
        return intl.formatMessage(
            { id: "dialogs.save.as.new.default.title" },
            {
                title: dashboardTitleProp,
            },
        );
    }, [dashboardTitleProp, intl]);

    const [dashboardTitle, setDashboardTitle] = useState(getDefaultDashboardTitle());

    const canCreateDashboard = useCallback(() => {
        return isDashboardLoaded && !isDashboardSaving;
    }, [isDashboardLoaded, isDashboardSaving]);

    const handleTitleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
        e.target.select();
    }, []);

    const handleTitleBlur = useCallback(
        (e: FocusEvent<HTMLInputElement>) => {
            const newDashboardTitle = e.target.value.trim();
            setDashboardTitle(newDashboardTitle === "" ? getDefaultDashboardTitle() : newDashboardTitle);
        },
        [getDefaultDashboardTitle],
    );

    const handleTitleChange = (value: string) => {
        setDashboardTitle(value);
    };

    const onSubmitHandler = useCallback(() => {
        const title = dashboardTitle.trim();
        if (canCreateDashboard() && title !== "") {
            onSubmit(
                title,
                true, // switch to the new dashboard
                // do not reuse the filter context in edit mode, create a new one with the current filter state
                // otherwise use the original filter context values when creating a copy
                !isInEditMode,
            );
        }
    }, [canCreateDashboard, dashboardTitle, isInEditMode, onSubmit]);

    const getNoteText = useCallback(() => {
        const messageId = compact([
            isKpiWidgetEnabled && messages.saveAsNewAlertsAndEmailsMessage.id,
            !isKpiWidgetEnabled && messages.saveAsNewEmailsMessage.id,
        ]).at(0);

        return messageId ? intl.formatMessage({ id: messageId }) : "";
    }, [intl, isKpiWidgetEnabled]);

    const noteText = getNoteText();

    return (
        <ConfirmDialog
            onCancel={onCancel}
            onSubmit={onSubmitHandler}
            isPositive
            className="s-dialog save-as-new-dialog"
            headline={intl.formatMessage({ id: "dialogs.save.as.new.title" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "create.dashboard" })}
            isSubmitDisabled={isDashboardSaving || dashboardTitle.trim() === ""}
        >
            <Typography tagName="p" className="dashboard-note">
                {intl.formatMessage({ id: "dialogs.save.as.new.desc" })}
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

export const SaveAsDialogRendererIntl = SaveAsNewDashboardDialog;

export function SaveAsDialogRenderer(props: ISaveAsDialogRendererOwnProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <SaveAsDialogRendererIntl {...props} />
        </IntlWrapper>
    );
}
