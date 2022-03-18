// (C) 2022 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";
import { IScheduledMail } from "@gooddata/sdk-backend-spi";
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";
import { ScheduledEmail } from "./ScheduledEmail";

interface IScheduledEmailsProps {
    isLoading: boolean;
    scheduledEmails: IScheduledMail[];
    currentUserEmail?: string;
}

export const ScheduledEmails: React.FC<IScheduledEmailsProps> = (props) => {
    const { isLoading, scheduledEmails, currentUserEmail } = props;

    if (isLoading) {
        return <LoadingSpinner className="gd-scheduled-emails-loading-spinner large" />;
    }

    if (scheduledEmails.length === 0) {
        return (
            <div className="gd-scheduled-emails-message">
                <FormattedMessage id="dialogs.schedule.management.noSchedules" values={{ br: <br /> }} />
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
                />
            ))}
        </>
    );
};
