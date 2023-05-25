// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { IScheduledMail, IWorkspaceUser } from "@gooddata/sdk-model";
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { ScheduledEmail } from "./ScheduledEmail.js";

interface IScheduledEmailsProps {
    onDelete: (scheduledEmail: IScheduledMail) => void;
    onEdit: (scheduledEmail: IScheduledMail, users: IWorkspaceUser[]) => void;
    isLoading: boolean;
    scheduledEmails: IScheduledMail[];
    currentUserEmail?: string;
    noSchedulesMessageId: string;
    canManageScheduledMail: boolean;
    users: IWorkspaceUser[];
}

export const ScheduledEmails: React.FC<IScheduledEmailsProps> = (props) => {
    const {
        isLoading,
        scheduledEmails,
        currentUserEmail,
        onDelete,
        onEdit,
        noSchedulesMessageId,
        canManageScheduledMail,
        users,
    } = props;
    const theme = useTheme();

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
                    onEdit={onEdit}
                    users={users}
                    canManageScheduledMail={canManageScheduledMail}
                />
            ))}
        </>
    );
};
