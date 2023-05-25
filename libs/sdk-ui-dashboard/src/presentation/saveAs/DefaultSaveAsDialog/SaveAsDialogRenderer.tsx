// (C) 2020-2022 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ConfirmDialog, Input, Message, Typography } from "@gooddata/sdk-ui-kit";
import compact from "lodash/compact.js";
import first from "lodash/first.js";
import noop from "lodash/noop.js";
import { IntlWrapper } from "../../localization/index.js";
import { DASHBOARD_TITLE_MAX_LENGTH } from "../../constants/index.js";
import { messages } from "../../../locales.js";

interface ISaveAsNewDashboardDialogState {
    dashboardTitle: string;
}

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
export class SaveAsNewDashboardDialog extends React.PureComponent<
    ISaveAsDialogRendererOwnProps & WrappedComponentProps,
    ISaveAsNewDashboardDialogState
> {
    constructor(props: ISaveAsDialogRendererOwnProps & WrappedComponentProps) {
        super(props);
        const defaultDashboardTitle = this.getDefaultDashboardTitle();

        this.state = {
            dashboardTitle: defaultDashboardTitle,
        };
    }

    private getDefaultDashboardTitle(): string {
        return this.props.intl.formatMessage(
            { id: "dialogs.save.as.new.default.title" },
            {
                title: this.props.dashboardTitle,
            },
        );
    }

    private canCreateDashboard(): boolean {
        const { isDashboardLoaded, isDashboardSaving } = this.props;

        return isDashboardLoaded && !isDashboardSaving;
    }

    handleTitleFocus = (e: any) => {
        e.target.select();
    };

    handleTitleBlur = (e: any) => {
        const dashboardTitle = e.target.value.trim();
        this.setState({
            dashboardTitle: dashboardTitle === "" ? this.getDefaultDashboardTitle() : dashboardTitle,
        });
    };

    handleTitleChange = (value: string) => {
        this.setState({
            dashboardTitle: value,
        });
    };

    onSubmit = (): void => {
        const title = this.state.dashboardTitle.trim();
        if (this.canCreateDashboard() && title !== "") {
            this.props.onSubmit(
                title,
                true, // switch to the new dashboard
                // do not reuse the filter context in edit mode, create a new one with the current filter state
                // otherwise use the original filter context values when creating a copy
                !this.props.isInEditMode,
            );
        }
    };

    private getNoteText = (): string => {
        const { isKpiWidgetEnabled, isScheduleEmailsEnabled, intl } = this.props;
        const messageId = first(
            compact([
                isKpiWidgetEnabled && isScheduleEmailsEnabled && messages.saveAsNewAlertsAndEmailsMessage.id,
                isKpiWidgetEnabled && !isScheduleEmailsEnabled && messages.saveAsNewAlertsMessage.id,
                !isKpiWidgetEnabled && isScheduleEmailsEnabled && messages.saveAsNewEmailsMessage.id,
            ]),
        );

        return messageId ? intl.formatMessage({ id: messageId }) : "";
    };

    public render() {
        const {
            intl: { formatMessage },
            onCancel = noop,
            isDashboardSaving,
        } = this.props;
        const { dashboardTitle } = this.state;

        const noteText = this.getNoteText();

        return (
            <ConfirmDialog
                onCancel={onCancel}
                onSubmit={this.onSubmit}
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
                        onFocus={this.handleTitleFocus}
                        onBlur={this.handleTitleBlur}
                        value={dashboardTitle}
                        placeholder={this.getDefaultDashboardTitle()}
                        onChange={this.handleTitleChange as any}
                    />
                </div>
                {noteText ? <Message type="progress">{noteText}</Message> : null}
            </ConfirmDialog>
        );
    }
}

export const SaveAsDialogRendererIntl = injectIntl(SaveAsNewDashboardDialog);

export const SaveAsDialogRenderer: React.FC<ISaveAsDialogRendererOwnProps> = (props) => (
    <IntlWrapper locale={props.locale}>
        <SaveAsDialogRendererIntl {...props} />
    </IntlWrapper>
);
