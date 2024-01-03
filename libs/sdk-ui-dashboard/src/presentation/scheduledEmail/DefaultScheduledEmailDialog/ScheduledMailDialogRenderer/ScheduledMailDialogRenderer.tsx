// (C) 2019-2023 GoodData Corporation
import * as React from "react";
import cloneDeep from "lodash/cloneDeep.js";
import differenceBy from "lodash/differenceBy.js";
import isEqual from "lodash/isEqual.js";
import omit from "lodash/omit.js";
import { injectIntl, WrappedComponentProps, FormattedMessage } from "react-intl";
import parse from "date-fns/parse/index.js";
import { normalizeTime, ConfirmDialogBase, Overlay, Alignment, Message } from "@gooddata/sdk-ui-kit";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    ObjRef,
    IUser,
    uriRef,
    objRefToString,
    areObjRefsEqual,
    IScheduledMail,
    IScheduledMailDefinition,
    isDashboardAttachment,
    isWidgetAttachment,
    ScheduledMailAttachment,
    IWorkspaceUser,
    UriRef,
    WeekStart,
} from "@gooddata/sdk-model";
import { GoodDataSdkError, withContexts } from "@gooddata/sdk-ui";
import memoize from "lodash/memoize.js";

import {
    DEFAULT_REPEAT_PERIOD,
    PLATFORM_DATE_FORMAT,
    REPEAT_EXECUTE_ON,
    REPEAT_FREQUENCIES,
    REPEAT_TYPES,
} from "../constants.js";
import {
    IScheduleEmailRecipient,
    IScheduleEmailRepeat,
    IScheduleEmailRepeatTime,
    isScheduleEmailExistingRecipient,
    isScheduleEmailExternalRecipient,
    IWidgetExportConfiguration,
    IWidgetsSelection,
} from "../interfaces.js";
import {
    generateRepeatString,
    setDailyRepeat,
    setMonthlyRepeat,
    setWeeklyRepeat,
    parseRepeatString,
} from "../utils/repeat.js";
import { getScheduledEmailSummaryString } from "../utils/scheduledMailSummary.js";
import { getScheduledEmailRecipientEmail } from "../utils/scheduledMailRecipients.js";
import { getTimezoneByIdentifier, getUserTimezone, ITimezone, TIMEZONE_DEFAULT } from "../utils/timezone.js";
import {
    getDate,
    getMonth,
    getYear,
    convertDateToDisplayDateString,
    convertDateToPlatformDateString,
} from "../utils/datetime.js";
import { isEmail } from "../utils/validate.js";

import { Textarea } from "./Textarea.js";
import { RepeatSelect, IRepeatSelectData } from "./RepeatSelect/RepeatSelect.js";
import { Input } from "./Input.js";
import { DateTime } from "./DateTime.js";
import { Attachments } from "./Attachments/Attachments.js";
import { RecipientsSelect } from "./RecipientsSelect/RecipientsSelect.js";
import { IntlWrapper } from "../../../localization/index.js";
import { DASHBOARD_TITLE_MAX_LENGTH } from "../../../constants/index.js";
import { AttachmentNoWidgets } from "./Attachments/AttachmentNoWidgets.js";
import { IInsightWidgetExtended } from "../useScheduledEmail.js";

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
    dashboardInsightWidgets: IInsightWidgetExtended[];

    /**
     * Filters on the dashboard have not been changed so the dashboard filters should be used for the schedule
     */
    hasDefaultFilters: boolean;

    /**
     * Current user - is always recipient of newly created scheduled email.
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
     * Define start day of the week. This value will be used for datepicker. Sunday will be used as a default.
     */
    weekStart?: WeekStart;

    /**
     * Has user canListUsersInProject permission?
     */
    canListUsersInProject?: boolean;

    /**
     * Is user allowed to perform tabular exports?
     */
    canExportTabular?: boolean;

    /**
     * Is enableKPIDashboardScheduleRecipients feature flag turned on?
     */
    enableKPIDashboardScheduleRecipients?: boolean;

    /**
     * Is the new UI and workflow for scheduled emailing with widgets is enabled?
     */
    enableWidgetExportScheduling?: boolean;

    /**
     * Schedule to be edited. If defined, it switches the dialog to edit mode.
     */
    editSchedule?: IScheduledMail;

    /**
     * Attachment to be selected by default.
     */
    defaultAttachment?: ObjRef;

    /**
     * Callback to be called, when user close the scheduled email dialog.
     */
    onCancel?: () => void;

    /**
     * Callback to be called, when user submit the scheduled email dialog.
     */
    onSubmit?: (scheduledEmailData: IScheduledMailDefinition) => void;

    /**
     * Callback to be called, when user saves the existing schedule.
     */
    onSave?: (scheduledEmailData: IScheduledMailDefinition, filterContextRef?: ObjRef) => void;

    /**
     * Callback to be called, when error occurs.
     */
    onError?: (error: GoodDataSdkError) => void;

    /**
     * Workspace users.
     */
    users: IWorkspaceUser[];
}

export type IScheduledMailDialogRendererProps = IScheduledMailDialogRendererOwnProps &
    WrappedComponentProps & { backend?: IAnalyticalBackend; workspace?: string };

type IScheduledMailDialogRendererState = {
    alignment: string;
    userTimezone: ITimezone;
    emailSubject: string;
    emailBody: string;
    startDate: Date;
    repeat: IScheduleEmailRepeat;
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

    // when editing, save initial state to compare if anything changed
    private originalEditState: IScheduledMailDialogRendererState | undefined;

    constructor(props: IScheduledMailDialogRendererProps) {
        super(props);

        this.state = this.props.editSchedule
            ? this.getEditState(this.props.editSchedule, this.props.users)
            : this.getDefaultState();
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
            repeat: {
                time: {
                    hour: normalizedTime.getHours(),
                    minute: normalizedTime.getMinutes(),
                    second: 0,
                },
                repeatType: REPEAT_TYPES.DAILY,
                repeatPeriod: DEFAULT_REPEAT_PERIOD,
                repeatFrequency: {
                    [REPEAT_FREQUENCIES.DAY]: true,
                },
            },
            selectedRecipients: [userToRecipient(this.props.currentUser)],
            isValidScheduleEmailData: true,
            attachments: {
                ...this.getDefaultAttachments(),
                configuration: {
                    format: "csv",
                    mergeHeaders: true,
                    includeFilters: true,
                },
            },
        };
    }

    private getEditState(
        schedule: IScheduledMail,
        users: IWorkspaceUser[],
    ): IScheduledMailDialogRendererState {
        const defaultState = this.getDefaultState();

        const selectedRecipients = schedule.to.concat(schedule.bcc || []).map((email) => {
            /**
             * There can be the case that users might have different email and login address
             * Need to make the comparison from user login, since email is not an unique value
             */
            if (email === schedule.createdBy?.login) {
                return userToRecipient(schedule.createdBy);
            } else {
                return { email };
            }
        });
        /**
         *  At this point, all recipients except the author are stored as external (IScheduleEmailExternalRecipient).
         *  They will be compared with workspace users and potentially switched to workspace recipients (IScheduleEmailExistingRecipient)
         *  and obtain correct values to be displayed on UI
         */
        const processedRecipients = selectedRecipients.map((recipient) => {
            if (isScheduleEmailExternalRecipient(recipient)) {
                // need to make the comparison from user login, since email is not an unique value
                const user = users.find((user) => user.login === recipient.email);
                if (user) {
                    return { user };
                }
            }

            return recipient;
        });

        const dashboardAttachments = schedule.attachments.filter(isDashboardAttachment);
        const widgetAttachments = schedule.attachments.filter(isWidgetAttachment);
        const widgetsSelected = this.props.dashboardInsightWidgets.reduce(
            (acc: IWidgetsSelection, widget) => {
                const widgetKey = objRefToString(widget);
                acc[widgetKey] = widgetAttachments.some((widgetAttachment) => {
                    return areObjRefsEqual(widgetAttachment.widget, widget);
                });
                return acc;
            },
            {},
        );

        const configuration: IWidgetExportConfiguration =
            widgetAttachments.length === 0
                ? defaultState.attachments.configuration
                : {
                      format: widgetAttachments[0].formats[0] || "csv",
                      mergeHeaders: widgetAttachments[0].exportOptions?.mergeHeaders || false,
                      includeFilters: widgetAttachments[0].exportOptions?.includeFilters || false,
                  };

        const newState = {
            ...defaultState,
            emailSubject: schedule.subject,
            emailBody: schedule.body,
            selectedRecipients: processedRecipients,
            userTimezone: getTimezoneByIdentifier(schedule.when.timeZone) || TIMEZONE_DEFAULT,
            startDate: parse(schedule.when.startDate, PLATFORM_DATE_FORMAT, new Date()),
            isValidScheduleEmailData: true,
            repeat: parseRepeatString(schedule.when.recurrence),
            attachments: {
                dashboardSelected: dashboardAttachments.length !== 0,
                widgetsSelected,
                configuration,
            },
        };
        this.originalEditState = newState;

        return newState;
    }

    private getDefaultAttachments() {
        const { enableWidgetExportScheduling, defaultAttachment, dashboardInsightWidgets } = this.props;
        const isDefaultAttachmentValid = dashboardInsightWidgets.some((widget) =>
            areObjRefsEqual(widget.ref, defaultAttachment),
        );

        if (enableWidgetExportScheduling && defaultAttachment && isDefaultAttachmentValid) {
            return {
                dashboardSelected: false,
                widgetsSelected: { [objRefToString(defaultAttachment)]: true },
            };
        } else {
            return {
                dashboardSelected: true,
                widgetsSelected: dashboardInsightWidgets.reduce((acc: IWidgetsSelection, widget) => {
                    acc[objRefToString(widget)] = false;
                    return acc;
                }, {}),
            };
        }
    }

    public render() {
        const { intl, onCancel, editSchedule, enableWidgetExportScheduling } = this.props;
        const { alignment, isValidScheduleEmailData } = this.state;
        const alignPoints = [
            {
                align: alignment,
            },
        ];

        const isSubmitDisabled =
            !isValidScheduleEmailData ||
            (editSchedule &&
                isEqual(omit(this.originalEditState, "alignment"), omit(this.state, "alignment")));

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
                    headline={
                        enableWidgetExportScheduling
                            ? intl.formatMessage({ id: "dialogs.schedule.email.heading" })
                            : intl.formatMessage({ id: "dialogs.schedule.email.headline" })
                    }
                    cancelButtonText={intl.formatMessage({ id: "cancel" })}
                    submitButtonText={
                        editSchedule
                            ? intl.formatMessage({ id: `dialogs.schedule.email.save` })
                            : intl.formatMessage({ id: `dialogs.schedule.email.submit` })
                    }
                    isSubmitDisabled={isSubmitDisabled}
                    submitOnEnterKey={false}
                    onCancel={onCancel}
                    onSubmit={this.onScheduleDialogSubmit}
                >
                    {this.renderFiltersMessage()}
                    {this.renderRecipients()}
                    {this.renderUnsubscribedRecipients()}
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
            canExportTabular,
        } = this.props;

        const { dashboardSelected, widgetsSelected, configuration } = this.state.attachments;

        const defaultAttachment = this.getDefaultAttachment();
        const fileName = `${defaultAttachment}.pdf`;
        return enableWidgetExportScheduling ? (
            <Attachments
                dashboardTitle={dashboardTitle}
                insightWidgets={dashboardInsightWidgets}
                dashboardSelected={dashboardSelected}
                widgetsSelected={widgetsSelected}
                configuration={configuration}
                canExportTabular={canExportTabular}
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
        const { dateFormat, intl, locale, weekStart } = this.props;

        const {
            repeat: { time },
            startDate,
        } = this.state;

        const sendDate = new Date(
            getYear(startDate),
            getMonth(startDate) - 1,
            getDate(startDate),
            time.hour,
            time.minute,
        );
        return (
            <DateTime
                date={sendDate}
                dateFormat={dateFormat}
                label={intl.formatMessage({ id: "dialogs.schedule.email.time.label" })}
                locale={locale}
                timezone={this.state.userTimezone.title}
                onDateChange={this.onDateChange}
                onTimeChange={this.onTimeChange}
                weekStart={weekStart}
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
                value={this.state.emailBody}
            />
        );
    };

    private renderFiltersMessage = (): React.ReactNode => {
        const { enableWidgetExportScheduling, hasDefaultFilters, editSchedule } = this.props;
        if (editSchedule) {
            return (
                <Message className="gd-schedule-email-dialog-filters-message " type="progress">
                    <FormattedMessage id="dialogs.schedule.email.filters.not.saved" />
                </Message>
            );
        }
        if (enableWidgetExportScheduling && !hasDefaultFilters) {
            return (
                <Message className="gd-schedule-email-dialog-filters-message " type="progress">
                    <FormattedMessage id="dialogs.schedule.email.filters" />
                </Message>
            );
        }

        return null;
    };

    private renderRecipients = (): React.ReactNode => {
        const { selectedRecipients } = this.state;
        const {
            backend,
            workspace,
            canListUsersInProject,
            enableKPIDashboardScheduleRecipients,
            currentUser,
            editSchedule,
        } = this.props;

        // it should be possible to remove the only remaining recipient if the author unsubscribed
        const allowEmptySelection = editSchedule?.unsubscribed?.some(
            (unsubscribedRecipient) => unsubscribedRecipient === editSchedule.createdBy?.email,
        );

        return (
            <RecipientsSelect
                author={userToRecipient(editSchedule?.createdBy ? editSchedule?.createdBy : currentUser)}
                currentUser={currentUser}
                canListUsersInProject={canListUsersInProject}
                enableKPIDashboardScheduleRecipients={enableKPIDashboardScheduleRecipients}
                value={selectedRecipients}
                originalValue={this.originalEditState?.selectedRecipients || []}
                onChange={this.onRecipientsChange}
                onError={this.props.onError}
                backend={backend}
                workspace={workspace}
                allowEmptySelection={allowEmptySelection}
            />
        );
    };

    private renderUnsubscribedRecipients = (): React.ReactNode => {
        const { intl, editSchedule } = this.props;
        const unsubscribedAmount =
            editSchedule?.unsubscribed?.length === undefined ? 0 : editSchedule.unsubscribed.length;
        return (
            unsubscribedAmount !== 0 && (
                <div className="gd-input-component">
                    <span className="gd-schedule-email-dialog-unsubscribed-recipients">
                        {intl.formatMessage(
                            { id: "dialogs.schedule.email.unsubscribed.recipients" },
                            { n: unsubscribedAmount },
                        )}
                    </span>
                </div>
            )
        );
    };

    private renderRepeats = (): React.ReactNode => {
        const { intl } = this.props;
        const { startDate, repeat } = this.state;

        let repeatFrequency = REPEAT_FREQUENCIES.DAY;
        let repeatExecuteOn = REPEAT_EXECUTE_ON.DAY_OF_MONTH;

        if (repeat.repeatFrequency.week) {
            repeatFrequency = REPEAT_FREQUENCIES.WEEK;
        } else if (repeat.repeatFrequency.month) {
            repeatFrequency = REPEAT_FREQUENCIES.MONTH;
            repeatExecuteOn = repeat.repeatFrequency.month.type;
        }
        return (
            <RepeatSelect
                label={intl.formatMessage({ id: "dialogs.schedule.email.repeats.label" })}
                repeatExecuteOn={repeatExecuteOn}
                repeatFrequency={repeatFrequency}
                repeatPeriod={repeat.repeatPeriod}
                repeatType={repeat.repeatType}
                startDate={startDate}
                onChange={this.onRepeatsChange}
            />
        );
    };

    private renderSubject = (): React.ReactNode => {
        const { intl } = this.props;
        return (
            <Input
                className="s-gd-schedule-email-dialog-subject"
                label={intl.formatMessage({ id: "dialogs.schedule.email.subject.label" })}
                maxlength={MAX_SUBJECT_LENGTH}
                placeholder={this.getDefaultSubject()}
                value={this.state.emailSubject}
                onChange={this.onSubjectChange}
            />
        );
    };

    // Listeners
    private onScheduleDialogSubmit = (): void => {
        const { onSubmit, onSave, editSchedule } = this.props;
        if (editSchedule) {
            if (onSave) {
                const originalFilterContext = editSchedule?.attachments[0]?.filterContext;
                onSave(this.getScheduleEmailData(), originalFilterContext);
            }
        } else {
            if (onSubmit) {
                onSubmit(this.getScheduleEmailData());
            }
        }
    };

    private onDateChange = (selectedDateObject: Date): void => {
        const { repeatFrequency } = this.state.repeat;

        const newRepeat = cloneDeep(this.state.repeat);

        if (repeatFrequency.month) {
            setMonthlyRepeat(newRepeat, repeatFrequency.month.type, selectedDateObject);
        } else if (repeatFrequency.week) {
            setWeeklyRepeat(newRepeat, selectedDateObject);
        } else {
            setDailyRepeat(newRepeat);
        }

        this.setState({
            startDate: selectedDateObject,
            repeat: newRepeat,
        });
    };

    private onTimeChange = (time: IScheduleEmailRepeatTime): void => {
        this.setState((prevState) => {
            return {
                repeat: {
                    ...prevState.repeat,
                    time,
                },
            };
        });
    };

    private onRecipientsChange = (selectedRecipients: IScheduleEmailRecipient[]): void => {
        const { editSchedule, currentUser } = this.props;
        const allRecipientsAreEmails = selectedRecipients.map(getScheduledEmailRecipientEmail).every(isEmail);

        const newExternalRecipientsEmails: string[] = selectedRecipients
            .filter(isScheduleEmailExternalRecipient)
            .map((recipient) => recipient.email);
        const hasNewExternalRecipients = editSchedule
            ? differenceBy(newExternalRecipientsEmails, editSchedule.bcc || []).length > 0
            : false;

        const author = userToRecipient(editSchedule?.createdBy ? editSchedule?.createdBy : currentUser);
        const currentUserIsAuthor =
            isScheduleEmailExistingRecipient(author) && areObjRefsEqual(author.user.ref, currentUser.ref);

        this.setState({
            selectedRecipients,
            // new external recipients are not allowed when the current user is not the author of edited schedule
            isValidScheduleEmailData:
                allRecipientsAreEmails && (currentUserIsAuthor || !hasNewExternalRecipients),
        });
    };

    private onMessageChange = (value: string): void => {
        this.setState({
            emailBody: value,
        });
    };

    private onRepeatsChange = (data: IRepeatSelectData): void => {
        const { repeatExecuteOn, repeatFrequency, repeatPeriod, repeatType } = data;
        const { startDate } = this.state;

        const newRepeat = cloneDeep(this.state.repeat);
        newRepeat.repeatType = repeatType;
        newRepeat.repeatPeriod = repeatPeriod;

        if (repeatType === REPEAT_TYPES.CUSTOM) {
            if (repeatFrequency === REPEAT_FREQUENCIES.MONTH) {
                setMonthlyRepeat(newRepeat, repeatExecuteOn, startDate);
            } else if (repeatFrequency === REPEAT_FREQUENCIES.WEEK) {
                setWeeklyRepeat(newRepeat, startDate);
            } else {
                setDailyRepeat(newRepeat);
            }
        } else if (repeatType === REPEAT_TYPES.MONTHLY) {
            setMonthlyRepeat(newRepeat, REPEAT_EXECUTE_ON.DAY_OF_WEEK, startDate);
        } else if (repeatType === REPEAT_TYPES.WEEKLY) {
            setWeeklyRepeat(newRepeat, startDate);
        } else {
            setDailyRepeat(newRepeat);
        }

        this.setState({ repeat: newRepeat });
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

    private getDefaultAttachment = (): string => {
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

    private getDefaultSubject = (): string => {
        const { dashboardTitle } = this.props;
        const isDashboardTitleTooLong = dashboardTitle.length > MAX_DASHBOARD_TITLE_LENGTH;
        return isDashboardTitleTooLong
            ? dashboardTitle.substring(0, MAX_DASHBOARD_TITLE_LENGTH)
            : dashboardTitle;
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
            (acc: Record<string, UriRef>, widget) => {
                acc[objRefToString(widget)] = uriRef(widget.uri);
                return acc;
            },
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
        const { editSchedule } = this.props;

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

        let unsubscribed: string[] | undefined = undefined;
        if (editSchedule) {
            unsubscribed = differenceBy(editSchedule.unsubscribed, toEmails.concat(bccEmails));
        }

        return {
            when,
            to: toEmails,
            bcc: bccEmails,
            unsubscribed,
            subject,
            body,
            attachments,
            description,
            title: subject,
            // Every scheduled email is private for the logged in user.
            unlisted: true,
            uri: editSchedule ? editSchedule.uri : undefined,
        };
    };

    private getTimeSchedule = (): IScheduledMailDefinition["when"] => {
        const recurrence = generateRepeatString(this.state.repeat);
        const startDate = convertDateToPlatformDateString(this.state.startDate);
        return {
            recurrence,
            startDate,
            timeZone: this.state.userTimezone.identifier,
        };
    };

    private getSummaryMessage = (): string => {
        const { startDate, repeat } = this.state;
        return getScheduledEmailSummaryString(this.props.intl, repeat, startDate);
    };
}

export const ScheduledMailDialogRendererIntl = withContexts(injectIntl(ScheduledMailDialogRendererUI));

export const ScheduledMailDialogRenderer: React.FC<IScheduledMailDialogRendererOwnProps> = (props) => (
    <IntlWrapper locale={props.locale}>
        <ScheduledMailDialogRendererIntl {...props} />
    </IntlWrapper>
);
