// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { IScheduledMail, ITheme } from "@gooddata/sdk-model";
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";
import { ScheduledEmail } from "./ScheduledEmail";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

interface IScheduledEmailsProps {
    onDelete: (scheduledEmail: IScheduledMail) => void;
    isLoading: boolean;
    scheduledEmails: IScheduledMail[];
    currentUserEmail?: string;
    theme?: ITheme;
    noSchedulesMessageId: string;
}

const ScheduledEmailsComponent: React.FC<IScheduledEmailsProps> = (props) => {
    const { isLoading, scheduledEmails, currentUserEmail, onDelete, theme, noSchedulesMessageId } = props;

    if (isLoading) {
        return (
            <div className="gd-loading-equalizer-wrap">
                <div className="gd-loading-equalizer gd-loading-equalizer-fade">
                    <LoadingSpinner
                        className="large gd-loading-equalizer-spinner"
                        color={theme?.palette?.complementary?.c9}
                    />
                </div>
            </div>
        );
    }

    if (scheduledEmails.length === 0) {
        return (
            <div className="gd-scheduled-emails-message s-no-schedules-message">
                <FormattedMessage id={noSchedulesMessageId} values={{ br: <br /> }} />
            </div>
        );
    }

    return (
        <>
            {scheduledEmails.map((scheduledEmail) => (
                <ScheduledEmail
                    key={scheduledEmail.identifier}
                    scheduledEmail={scheduledEmail}
                    currentUserEmail={currentUserEmail}
                    onDelete={onDelete}
                />
            ))}
        </>
    );
};

export const ScheduledEmails = withTheme(ScheduledEmailsComponent);
