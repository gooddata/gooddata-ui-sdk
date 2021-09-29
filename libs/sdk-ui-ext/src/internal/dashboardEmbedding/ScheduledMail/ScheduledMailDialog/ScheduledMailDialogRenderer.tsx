// (C) 2019-2020 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { normalizeTime, ConfirmDialogBase, Overlay, Alignment } from "@gooddata/sdk-ui-kit";
import { IAnalyticalBackend, IScheduledMailDefinition, IUser } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import memoize from "lodash/memoize";

import {
    DEFAULT_REPEAT_PERIOD,
    REPEAT_EXECUTE_ON,
    REPEAT_FREQUENCIES,
    REPEAT_TYPES,
    DASHBOARD_TITLE_MAX_LENGTH,
} from "../constants";
import {
    IScheduleEmailRecipient,
    IScheduleEmailRepeat,
    IScheduleEmailRepeatTime,
    isScheduleEmailExistingRecipient,
    isScheduleEmailExternalRecipient,
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
import { Attachment } from "./Attachment";
import { RecipientsSelect } from "./RecipientsSelect/RecipientsSelect";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";

const MAX_MESSAGE_LENGTH = 200;
const MAX_SUBJECT_LENGTH = 200;
const MAX_DASHBOARD_TITLE_LENGTH = DASHBOARD_TITLE_MAX_LENGTH;
const MAX_HYPHEN_LENGTH = 3;

export type IScheduledMailDialogRendererOwnProps = {
    /**
     * Reference of the dashboard to be attached to the scheduled email.
     */
    dashboard: ObjRef;

    /**
     * Title of the attached dashboard. Used to create the default subject of a scheduled email.
     */
    dashboardTitle: string;

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
     * Is enableKPIDashboardScheduleRecipients feature flag turned on?
     */
    enableKPIDashboardScheduleRecipients?: boolean;

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
};

export type IScheduledMailDialogRendererProps = IScheduledMailDialogRendererOwnProps & WrappedComponentProps;

type IScheduledMailDialogRendererState = {
    alignment: string;
    startDate: Date;
    startTime: IScheduleEmailRepeatTime;
    isValidScheduleEmailData: boolean;
    selectedRecipients: IScheduleEmailRecipient[];
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
    private repeatData: IScheduleEmailRepeat;
    private userTimezone: ITimezone;
    private emailSubject: string;
    private emailBody: string;

    static defaultProps: Pick<IScheduledMailDialogRendererProps, "dateFormat"> = {
        dateFormat: "MM/dd/yyyy",
    };

    constructor(props: IScheduledMailDialogRendererProps) {
        super(props);

        const now = new Date();
        const normalizedTime = normalizeTime(now);
        this.state = {
            alignment: "cc cc",
            startDate: now,
            startTime: {
                hour: normalizedTime.getHours(),
                minute: normalizedTime.getMinutes(),
                second: 0,
            },
            selectedRecipients: [userToRecipient(this.props.currentUser)],
            isValidScheduleEmailData: true,
        };

        this.repeatData = {
            date: {
                day: getDate(now),
                month: getMonth(now),
                year: getYear(now),
            },
            repeatExecuteOn: REPEAT_EXECUTE_ON.DAY_OF_MONTH,
            repeatFrequency: {
                [REPEAT_FREQUENCIES.DAY]: true,
            },
            repeatPeriod: DEFAULT_REPEAT_PERIOD,
            repeatType: REPEAT_TYPES.DAILY,
            time: {
                hour: normalizedTime.getHours(),
                minute: normalizedTime.getMinutes(),
                second: 0,
            },
        };

        this.userTimezone = getUserTimezone();
        this.emailSubject = "";
        this.emailBody = "";
    }

    public render(): React.ReactNode {
        const { intl, onCancel } = this.props;
        const alignPoints = [
            {
                align: this.state.alignment,
            },
        ];

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
                    headline={intl.formatMessage({ id: "dialogs.schedule.email.headline" })}
                    cancelButtonText={intl.formatMessage({ id: "cancel" })}
                    submitButtonText={intl.formatMessage({ id: "dialogs.schedule.email.submit" })}
                    isSubmitDisabled={!this.state.isValidScheduleEmailData}
                    submitOnEnterKey={false}
                    onCancel={onCancel}
                    onSubmit={this.onScheduleDialogSubmit}
                >
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
        const { intl } = this.props;
        const defaultEmailSubject = this.getDefaultSubject();
        const fileName = `${defaultEmailSubject}.pdf`;
        return (
            <Attachment
                className="s-gd-schedule-email-dialog-attachment"
                label={intl.formatMessage({ id: "dialogs.schedule.email.attachment.label" })}
                fileName={fileName}
            />
        );
    };

    private renderDateTime = (): React.ReactNode => {
        const { dateFormat, intl, locale } = this.props;

        const { date, time } = this.repeatData;
        const sendDate = new Date(date.year, date.month - 1, date.day, time.hour, time.minute);
        return (
            <DateTime
                date={sendDate}
                dateFormat={dateFormat}
                label={intl.formatMessage({ id: "dialogs.schedule.email.time.label" })}
                locale={locale}
                timezone={this.userTimezone.title}
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
        this.repeatData.date = {
            day: getDate(selectedDateObject),
            month: getMonth(selectedDateObject),
            year: getYear(selectedDateObject),
        };

        this.setState({ startDate: selectedDateObject }, () => {
            this.updateStartDateForRepeats(selectedDateObject);
        });
    };

    private onTimeChange = (time: IScheduleEmailRepeatTime): void => {
        this.repeatData.time = time;
        this.setState({
            startTime: time,
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
        this.emailBody = value;
    };

    private updateStartDateForRepeats(startDate: Date) {
        const repeatType = this.repeatData.repeatType;
        const repeatFrequency = this.repeatData.repeatFrequency;
        const repeatExecuteOn = this.repeatData.repeatExecuteOn;

        if (repeatType === REPEAT_TYPES.CUSTOM) {
            if (repeatFrequency === REPEAT_FREQUENCIES.MONTH) {
                setMonthlyRepeat(this.repeatData, repeatExecuteOn, startDate);
            } else if (repeatFrequency === REPEAT_FREQUENCIES.WEEK) {
                setWeeklyRepeat(this.repeatData, startDate);
            } else {
                setDailyRepeat(this.repeatData);
            }
        } else if (repeatType === REPEAT_TYPES.MONTHLY) {
            setMonthlyRepeat(this.repeatData, REPEAT_EXECUTE_ON.DAY_OF_WEEK, startDate);
        } else if (repeatType === REPEAT_TYPES.WEEKLY) {
            setWeeklyRepeat(this.repeatData, startDate);
        } else {
            setDailyRepeat(this.repeatData);
        }
    }

    private onRepeatsChange = (data: IRepeatSelectData): void => {
        const { repeatExecuteOn, repeatFrequency, repeatPeriod, repeatType } = data;
        const { startDate } = this.state;
        this.repeatData.repeatPeriod = repeatPeriod;
        this.repeatData.repeatType = repeatType;
        if (repeatType === REPEAT_TYPES.CUSTOM) {
            if (repeatFrequency === REPEAT_FREQUENCIES.MONTH) {
                setMonthlyRepeat(this.repeatData, repeatExecuteOn, startDate);
            } else if (repeatFrequency === REPEAT_FREQUENCIES.WEEK) {
                setWeeklyRepeat(this.repeatData, startDate);
            } else {
                setDailyRepeat(this.repeatData);
            }
        } else if (repeatType === REPEAT_TYPES.MONTHLY) {
            setMonthlyRepeat(this.repeatData, REPEAT_EXECUTE_ON.DAY_OF_WEEK, startDate);
        } else if (repeatType === REPEAT_TYPES.WEEKLY) {
            setWeeklyRepeat(this.repeatData, startDate);
        } else {
            setDailyRepeat(this.repeatData);
        }
    };

    private onSubjectChange = (value: string): void => {
        this.emailSubject = value;
    };

    // Internal utils

    private getDefaultSubject = (): string => {
        const { dashboardTitle, dateFormat } = this.props;
        const { startDate } = this.state;
        const displayDateString = convertDateToDisplayDateString(startDate, dateFormat);
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

    private getScheduleEmailData = (): IScheduledMailDefinition => {
        const when = this.getTimeSchedule();

        const { selectedRecipients: recipients } = this.state;
        /// To: is currently only owner
        const toEmails = recipients
            .filter(isScheduleEmailExistingRecipient)
            .map((recipient) => recipient.user.login);

        /// All other emails (without owner)
        const bccEmails = recipients
            .filter(isScheduleEmailExternalRecipient)
            .map((recipient) => recipient.email);

        const { dashboard } = this.props;
        const { emailSubject, emailBody } = this;
        const subject = emailSubject || this.getDefaultSubject();
        const body = emailBody || this.getDefaultEmailBody();
        const description = this.getSummaryMessage();

        return {
            when,
            to: toEmails,
            bcc: bccEmails,
            subject,
            body,
            attachments: [
                {
                    dashboard,
                    format: "pdf",
                },
            ],
            description,
            title: subject,
            // Every scheduled email is private for the logged in user.
            unlisted: true,
        };
    };

    private getTimeSchedule = (): IScheduledMailDefinition["when"] => {
        const recurrence = generateRepeatString(this.repeatData);
        const startDate = convertDateToPlatformDateString(this.state.startDate);
        return {
            recurrence,
            startDate,
            timeZone: this.userTimezone.identifier,
        };
    };

    private getSummaryMessage = (): string => {
        const {
            props: { intl },
            state: { startDate },
            repeatData,
        } = this;

        return getScheduledEmailSummaryString(intl, {
            repeatData,
            startDate,
        });
    };
}

export const ScheduledMailDialogRendererIntl = injectIntl(ScheduledMailDialogRendererUI);

export const ScheduledMailDialogRenderer: React.FC<IScheduledMailDialogRendererOwnProps> = (props) => (
    <InternalIntlWrapper locale={props.locale} workspace={props.workspace}>
        <ScheduledMailDialogRendererIntl {...props} />
    </InternalIntlWrapper>
);
