// (C) 2019-2022 GoodData Corporation
import * as React from "react";
import cloneDeep from "lodash/cloneDeep";
import { injectIntl, WrappedComponentProps, FormattedMessage } from "react-intl";
import { normalizeTime, ConfirmDialogBase, Overlay, Alignment, Message } from "@gooddata/sdk-ui-kit";
import {
    IAnalyticalBackend,
    IInsightWidget,
    IScheduledMailDefinition,
    ScheduledMailAttachment,
} from "@gooddata/sdk-backend-spi";
import { ObjRef, IUser, uriRef, objRefToString } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import memoize from "lodash/memoize";

import { DEFAULT_REPEAT_PERIOD, REPEAT_EXECUTE_ON, REPEAT_FREQUENCIES, REPEAT_TYPES } from "../constants";
import {
    IScheduleEmailRecipient,
    IScheduleEmailRepeat,
    IScheduleEmailRepeatTime,
    isScheduleEmailExistingRecipient,
    isScheduleEmailExternalRecipient,
    IWidgetExportConfiguration,
    IWidgetsSelection,
} from "../interfaces";
import { generateRepeatString, setDailyRepeat, setMonthlyRepeat, setWeeklyRepeat } from "../utils/repeat";
import { getScheduledEmailSummaryString } from "../utils/scheduledMailSummary";
import { getScheduledEmailRecipientEmail } from "../utils/scheduledMailRecipients";
import { getUserTimezone, ITimezone } from "../utils/timezone";
import {
    getDate,
    getMonth,
    getYear,
    convertDateToDisplayDateString,
    convertDateToPlatformDateString,
} from "../utils/datetime";
import { isEmail } from "../utils/validate";

import { Textarea } from "./Textarea";
import { RepeatSelect, IRepeatSelectData } from "./RepeatSelect/RepeatSelect";
import { Input } from "./Input";
import { DateTime } from "./DateTime";
import { Attachments } from "./Attachments/Attachments";
import { RecipientsSelect } from "./RecipientsSelect/RecipientsSelect";
import { IntlWrapper } from "../../../localization";
import { DASHBOARD_TITLE_MAX_LENGTH } from "../../../constants";
import { AttachmentNoWidgets } from "./Attachments/AttachmentNoWidgets";

const MAX_MESSAGE_LENGTH = 200;
const MAX_SUBJECT_LENGTH = 200;
const MAX_DASHBOARD_TITLE_LENGTH = DASHBOARD_TITLE_MAX_LENGTH;
const MAX_HYPHEN_LENGTH = 3;

export interface IScheduledMailDialogRendererOwnProps {
    /**
     * Reference of the dashboard to be attached to the scheduled email.
     */
    dashboard: ObjRef;

    /**
     * Title of the attached dashboard. Used to create the default subject of a scheduled email.
     */
    dashboardTitle: string;

    /**
     * Analytical insights widgets on the dashboard
     */
    dashboardInsightWidgets: IInsightWidget[];

    /**
     * Filters on the dashboard have not been changed so the dashboard filters should be used for the schedule
     */
    hasDefaultFilters: boolean;

    /**
     * Author of the scheduled email - is always recipient of the scheduled email.
     */
    currentUser: IUser;

    /**
     * Date format to use in DatePicker. To check the supported tokens,
     * see the `format` method of the https://date-fns.org/ library.
     */
    dateFormat?: string;

    /**
     * Locale to use for localization of texts appearing in the scheduled email dialog.
     */
    locale?: string;

    /**
     * Has user canListUsersInProject permission?
     */
    canListUsersInProject?: boolean;

    /**
     * Has user canExportReport permission?
     */
    canExportReport?: boolean;

    /**
     * Is enableKPIDashboardScheduleRecipients feature flag turned on?
     */
    enableKPIDashboardScheduleRecipients?: boolean;

    /**
     * Is the new UI and workflow for scheduled emailing with widgets is enabled?
     */
    enableWidgetExportScheduling?: boolean;

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the component MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to work with.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the component MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;

    /**
     * Callback to be called, when user close the scheduled email dialog.
     */
    onCancel?: () => void;

    /**
     * Callback to be called, when user submit the scheduled email dialog.
     */
    onSubmit?: (scheduledEmailData: IScheduledMailDefinition) => void;

    /**
     * Callback to be called, when error occurs.
     */
    onError?: (error: GoodDataSdkError) => void;
}

export type IScheduledMailDialogRendererProps = IScheduledMailDialogRendererOwnProps & WrappedComponentProps;

type IScheduledMailDialogRendererState = {
    alignment: string;
    userTimezone: ITimezone;
    emailSubject: string;
    emailBody: string;
    startDate: Date;
    recurrency: IScheduleEmailRepeat;
    isValidScheduleEmailData: boolean;
    selectedRecipients: IScheduleEmailRecipient[];
    attachments: {
        dashboardSelected: boolean;
        widgetsSelected: IWidgetsSelection;
        configuration: IWidgetExportConfiguration;
    };
};

const userToRecipient = memoize(
    (user: IUser): IScheduleEmailRecipient => ({
        user,
    }),
);

export class ScheduledMailDialogRendererUI extends React.PureComponent<
    IScheduledMailDialogRendererProps,
    IScheduledMailDialogRendererState
> {
    static defaultProps: Pick<IScheduledMailDialogRendererProps, "dateFormat"> = {
        dateFormat: "MM/dd/yyyy",
    };

    constructor(props: IScheduledMailDialogRendererProps) {
        super(props);

        this.state = this.getDefaultState();
    }

    private getDefaultState(): IScheduledMailDialogRendererState {
        const now = new Date();
        const normalizedTime = normalizeTime(now);

        return {
            alignment: "cc cc",
            startDate: now,
            userTimezone: getUserTimezone(),
            emailSubject: "",
            emailBody: "",
            recurrency: {
                time: {
                    hour: normalizedTime.getHours(),
                    minute: normalizedTime.getMinutes(),
                    second: 0,
                },
                repeatType: REPEAT_TYPES.DAILY,
                repeatPeriod: DEFAULT_REPEAT_PERIOD,
                date: {
                    day: getDate(now),
                    month: getMonth(now),
                    year: getYear(now),
                },
                repeatExecuteOn: REPEAT_EXECUTE_ON.DAY_OF_MONTH,
                repeatFrequency: {
                    [REPEAT_FREQUENCIES.DAY]: true,
                },
            },
            selectedRecipients: [userToRecipient(this.props.currentUser)],
            isValidScheduleEmailData: true,
            attachments: {
                dashboardSelected: true,
                widgetsSelected: this.props.dashboardInsightWidgets.reduce(
                    (acc, widget) => ({ ...acc, [objRefToString(widget)]: false }),
                    {},
                ),
                configuration: {
                    format: "csv",
                    mergeHeaders: true,
                    includeFilters: false,
                },
            },
        };
    }

    public render(): React.ReactNode {
        const { intl, onCancel } = this.props;
        const alignPoints = [
            {
                align: this.state.alignment,
            },
        ];

        const headingTranslationId = this.props.enableWidgetExportScheduling
            ? "dialogs.schedule.email.heading"
            : "dialogs.schedule.email.headline";
        return (
            <Overlay
                alignPoints={alignPoints}
                className="gd-schedule-email-dialog-overlay"
                isModal={true}
                positionType="fixed"
                onAlign={this.onAlign}
            >
                <ConfirmDialogBase
                    className="gd-schedule-email-dialog s-gd-schedule-email-dialog"
                    isPositive={true}
                    headline={intl.formatMessage({ id: headingTranslationId })}
                    cancelButtonText={intl.formatMessage({ id: "cancel" })}
                    submitButtonText={intl.formatMessage({ id: "dialogs.schedule.email.submit" })}
                    isSubmitDisabled={!this.state.isValidScheduleEmailData}
                    submitOnEnterKey={false}
                    onCancel={onCancel}
                    onSubmit={this.onScheduleDialogSubmit}
                >
                    {this.renderFiltersMessage()}
                    {this.renderRecipients()}
                    {this.renderSubject()}
                    {this.renderMessage()}
                    {this.renderAttachment()}

                    <div className="hr" />

                    {this.renderDateTime()}
                    {this.renderRepeats()}
                </ConfirmDialogBase>
            </Overlay>
        );
    }

    private getDashboardTitleMaxLength(displayDateString: string): number {
        return MAX_DASHBOARD_TITLE_LENGTH - displayDateString.trim().length - MAX_HYPHEN_LENGTH;
    }

    private onAlign = (alignment: Alignment) => {
        if (alignment.top < 0) {
            this.setState({ alignment: "tc tc" });
        }
    };

    private renderAttachment = (): React.ReactNode => {
        const {
            intl,
            dashboardTitle,
            dashboardInsightWidgets,
            enableWidgetExportScheduling,
            canExportReport,
        } = this.props;

        const { dashboardSelected, widgetsSelected, configuration } = this.state.attachments;

        const defaultEmailSubject = this.getDefaultSubject();
        const fileName = `${defaultEmailSubject}.pdf`;
        return enableWidgetExportScheduling ? (
            <Attachments
                dashboardTitle={dashboardTitle}
                insightWidgets={dashboardInsightWidgets}
                dashboardSelected={dashboardSelected}
                widgetsSelected={widgetsSelected}
                configuration={configuration}
                canExportReport={canExportReport}
                onAttachmentsSelectionChanged={this.onAttachmentsChange}
                onAttachmentsConfigurationChanged={this.onAttachmentsConfigurationChange}
            />
        ) : (
            <AttachmentNoWidgets
                className="s-gd-schedule-email-dialog-attachment"
                label={intl.formatMessage({ id: "dialogs.schedule.email.attachment.label" })}
                fileName={fileName}
            />
        );
    };

    private renderDateTime = (): React.ReactNode => {
        const { dateFormat, intl, locale } = this.props;

        const { time, date } = this.state.recurrency;
        const sendDate = new Date(date.year, date.month - 1, date.day, time.hour, time.minute);
        return (
            <DateTime
                date={sendDate}
                dateFormat={dateFormat}
                label={intl.formatMessage({ id: "dialogs.schedule.email.time.label" })}
                locale={locale}
                timezone={this.state.userTimezone.title}
                onDateChange={this.onDateChange}
                onTimeChange={this.onTimeChange}
            />
        );
    };

    private renderMessage = (): React.ReactNode => {
        const { intl } = this.props;
        const defaultEmailBody = this.getDefaultEmailBody();
        return (
            <Textarea
                className="s-gd-schedule-email-dialog-message"
                label={intl.formatMessage({ id: "dialogs.schedule.email.message.label" })}
                maxlength={MAX_MESSAGE_LENGTH}
                placeholder={defaultEmailBody}
                rows={4}
                onChange={this.onMessageChange}
            />
        );
    };

    private renderFiltersMessage = (): React.ReactNode => {
        const { enableWidgetExportScheduling, hasDefaultFilters } = this.props;
        if (enableWidgetExportScheduling && !hasDefaultFilters) {
            return (
                <Message className="gd-schedule-email-dialog-filters-message " type="progress">
                    <FormattedMessage id="dialogs.schedule.email.filters" />
                </Message>
            );
        }
    };

    private renderRecipients = (): React.ReactNode => {
        const { selectedRecipients } = this.state;
        const {
            backend,
            workspace,
            canListUsersInProject,
            enableKPIDashboardScheduleRecipients,
            currentUser,
        } = this.props;

        return (
            <RecipientsSelect
                currentUser={userToRecipient(currentUser)}
                canListUsersInProject={canListUsersInProject}
                enableKPIDashboardScheduleRecipients={enableKPIDashboardScheduleRecipients}
                value={selectedRecipients}
                onChange={this.onRecipientsChange}
                onError={this.props.onError}
                backend={backend}
                workspace={workspace}
            />
        );
    };

    private renderRepeats = (): React.ReactNode => {
        const { intl } = this.props;
        const { startDate } = this.state;
        return (
            <RepeatSelect
                label={intl.formatMessage({ id: "dialogs.schedule.email.repeats.label" })}
                repeatExecuteOn={REPEAT_EXECUTE_ON.DAY_OF_MONTH}
                repeatFrequency={REPEAT_FREQUENCIES.DAY}
                repeatPeriod={DEFAULT_REPEAT_PERIOD}
                repeatType={REPEAT_TYPES.DAILY}
                startDate={startDate}
                onChange={this.onRepeatsChange}
            />
        );
    };

    private renderSubject = (): React.ReactNode => {
        const { intl } = this.props;
        const defaultEmailSubject = this.getDefaultSubject();
        return (
            <Input
                className="s-gd-schedule-email-dialog-subject"
                label={intl.formatMessage({ id: "dialogs.schedule.email.subject.label" })}
                maxlength={MAX_SUBJECT_LENGTH}
                placeholder={defaultEmailSubject}
                onChange={this.onSubjectChange}
            />
        );
    };

    // Listeners
    private onScheduleDialogSubmit = (): void => {
        const { onSubmit } = this.props;
        if (onSubmit) {
            onSubmit(this.getScheduleEmailData());
        }
    };

    private onDateChange = (selectedDateObject: Date): void => {
        this.setState((prevState) => {
            return {
                recurrency: {
                    ...prevState.recurrency,
                    date: {
                        day: getDate(selectedDateObject),
                        month: getMonth(selectedDateObject),
                        year: getYear(selectedDateObject),
                    },
                },
            };
        });

        this.setState({ startDate: selectedDateObject }, () => {
            this.updateStartDateForRepeats(selectedDateObject);
        });
    };

    private onTimeChange = (time: IScheduleEmailRepeatTime): void => {
        this.setState((prevState) => {
            return {
                recurrency: {
                    ...prevState.recurrency,
                    time,
                },
            };
        });
    };

    private onRecipientsChange = (selectedRecipients: IScheduleEmailRecipient[]): void => {
        const isValidScheduleEmailData = selectedRecipients
            .map(getScheduledEmailRecipientEmail)
            .every(isEmail);
        this.setState({
            selectedRecipients,
            isValidScheduleEmailData,
        });
    };

    private onMessageChange = (value: string): void => {
        this.setState({
            emailBody: value,
        });
    };

    private updateStartDateForRepeats(startDate: Date) {
        const { repeatType, repeatFrequency, repeatExecuteOn } = this.state.recurrency;

        const newRecurrency = cloneDeep(this.state.recurrency);

        if (repeatType === REPEAT_TYPES.CUSTOM) {
            if (repeatFrequency === REPEAT_FREQUENCIES.MONTH) {
                setMonthlyRepeat(newRecurrency, repeatExecuteOn, startDate);
            } else if (repeatFrequency === REPEAT_FREQUENCIES.WEEK) {
                setWeeklyRepeat(newRecurrency, startDate);
            } else {
                setDailyRepeat(newRecurrency);
            }
        } else if (repeatType === REPEAT_TYPES.MONTHLY) {
            setMonthlyRepeat(newRecurrency, REPEAT_EXECUTE_ON.DAY_OF_WEEK, startDate);
        } else if (repeatType === REPEAT_TYPES.WEEKLY) {
            setWeeklyRepeat(newRecurrency, startDate);
        } else {
            setDailyRepeat(newRecurrency);
        }

        this.setState({ recurrency: newRecurrency });
    }

    private onRepeatsChange = (data: IRepeatSelectData): void => {
        const { repeatExecuteOn, repeatFrequency, repeatPeriod, repeatType } = data;
        const { startDate } = this.state;

        const newRecurrency = cloneDeep(this.state.recurrency);
        newRecurrency.repeatType = repeatType;
        newRecurrency.repeatPeriod = repeatPeriod;

        if (repeatType === REPEAT_TYPES.CUSTOM) {
            if (repeatFrequency === REPEAT_FREQUENCIES.MONTH) {
                setMonthlyRepeat(newRecurrency, repeatExecuteOn, startDate);
            } else if (repeatFrequency === REPEAT_FREQUENCIES.WEEK) {
                setWeeklyRepeat(newRecurrency, startDate);
            } else {
                setDailyRepeat(newRecurrency);
            }
        } else if (repeatType === REPEAT_TYPES.MONTHLY) {
            setMonthlyRepeat(newRecurrency, REPEAT_EXECUTE_ON.DAY_OF_WEEK, startDate);
        } else if (repeatType === REPEAT_TYPES.WEEKLY) {
            setWeeklyRepeat(newRecurrency, startDate);
        } else {
            setDailyRepeat(newRecurrency);
        }

        this.setState({ recurrency: newRecurrency });
    };

    private onSubjectChange = (value: string): void => {
        this.setState({
            emailSubject: value,
        });
    };

    private onAttachmentsChange = (dashboardSelected: boolean, widgetsSelected: IWidgetsSelection): void => {
        this.setState({
            attachments: {
                ...this.state.attachments,
                dashboardSelected,
                widgetsSelected,
            },
        });
    };
    private onAttachmentsConfigurationChange = (configuration: IWidgetExportConfiguration): void => {
        this.setState({
            attachments: {
                ...this.state.attachments,
                configuration,
            },
        });
    };

    // Internal utils

    private getDefaultSubject = (): string => {
        const { dashboardTitle, dateFormat } = this.props;
        const { startDate } = this.state;
        const displayDateString = convertDateToDisplayDateString(startDate, dateFormat!);
        const dashboardTitleMaxLength = this.getDashboardTitleMaxLength(displayDateString);
        const isDashboardTitleTooLong = dashboardTitle.length > dashboardTitleMaxLength;
        const truncatedDashboardTitle = isDashboardTitleTooLong
            ? dashboardTitle.substring(0, dashboardTitleMaxLength)
            : dashboardTitle;
        return `${truncatedDashboardTitle} - ${displayDateString}`;
    };

    private getDefaultEmailBody = (): string => {
        const { intl } = this.props;
        return intl.formatMessage({
            id: "dialogs.schedule.email.message.placeholder",
        });
    };

    private getAttachments = (dashboard: ObjRef): ScheduledMailAttachment[] => {
        const result: ScheduledMailAttachment[] = [];

        const { dashboardSelected, widgetsSelected, configuration } = this.state.attachments;
        if (dashboardSelected) {
            result.push({
                dashboard,
                format: "pdf",
            });
        }

        const exportOptions =
            configuration.format === "xlsx"
                ? {
                      mergeHeaders: configuration.mergeHeaders,
                      includeFilters: configuration.includeFilters,
                  }
                : undefined;
        const widgetsRefStringToUriRefMap = this.props.dashboardInsightWidgets.reduce(
            (acc, widget) => ({
                [objRefToString(widget)]: uriRef(widget.uri),
                ...acc,
            }),
            {},
        );
        for (const widgetRefString in widgetsSelected) {
            if (widgetsSelected[widgetRefString]) {
                result.push({
                    widget: widgetsRefStringToUriRefMap[widgetRefString],
                    widgetDashboard: dashboard,
                    formats: [configuration.format],
                    exportOptions,
                });
            }
        }

        return result;
    };

    private getScheduleEmailData = (): IScheduledMailDefinition => {
        const when = this.getTimeSchedule();

        const { selectedRecipients: recipients, emailSubject, emailBody } = this.state;
        /// To: is currently only owner
        const toEmails = recipients
            .filter(isScheduleEmailExistingRecipient)
            .map((recipient) => recipient.user.login);

        /// All other emails (without owner)
        const bccEmails = recipients
            .filter(isScheduleEmailExternalRecipient)
            .map((recipient) => recipient.email);

        const subject = emailSubject || this.getDefaultSubject();
        const body = emailBody || this.getDefaultEmailBody();
        const description = this.getSummaryMessage();
        const attachments = this.getAttachments(this.props.dashboard);

        return {
            when,
            to: toEmails,
            bcc: bccEmails,
            subject,
            body,
            attachments,
            description,
            title: subject,
            // Every scheduled email is private for the logged in user.
            unlisted: true,
        };
    };

    private getTimeSchedule = (): IScheduledMailDefinition["when"] => {
        const recurrence = generateRepeatString(this.state.recurrency);
        const startDate = convertDateToPlatformDateString(this.state.startDate);
        return {
            recurrence,
            startDate,
            timeZone: this.state.userTimezone.identifier,
        };
    };

    private getSummaryMessage = (): string => {
        const { startDate, recurrency } = this.state;
        return getScheduledEmailSummaryString(this.props.intl, recurrency, startDate);
    };
}

export const ScheduledMailDialogRendererIntl = injectIntl(ScheduledMailDialogRendererUI);

export const ScheduledMailDialogRenderer: React.FC<IScheduledMailDialogRendererOwnProps> = (props) => (
    <IntlWrapper locale={props.locale}>
        <ScheduledMailDialogRendererIntl {...props} />
    </IntlWrapper>
);
