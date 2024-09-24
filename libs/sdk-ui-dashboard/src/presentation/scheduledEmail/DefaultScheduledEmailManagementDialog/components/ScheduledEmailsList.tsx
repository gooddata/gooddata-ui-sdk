// (C) 2022-2024 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { ScheduledEmail } from "./ScheduledEmail.js";
import { INotificationChannel } from "../../types.js";

interface IScheduledEmailsProps {
    onDelete: (scheduledEmail: IAutomationMetadataObject) => void;
    onEdit: (scheduledEmail: IAutomationMetadataObject) => void;
    isLoading: boolean;
    scheduledEmails: IAutomationMetadataObject[];
    currentUserEmail?: string;
    noSchedulesMessageId: string;
    notificationChannels: INotificationChannel[];
}

export const ScheduledEmails: React.FC<IScheduledEmailsProps> = (props) => {
    const { isLoading, scheduledEmails, onDelete, onEdit, noSchedulesMessageId, notificationChannels } =
        props;
    const theme = useTheme();

    if (isLoading) {
        return (
            <div className="gd-loading-equalizer-wrap gd-notifications-channels-message">
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
            <div className="gd-notifications-channels-message s-no-schedules-message">
                <FormattedMessage id={noSchedulesMessageId} values={{ br: <br /> }} />
            </div>
        );
    }

    return (
        <>
            {scheduledEmails.map((scheduledEmail) => (
                <ScheduledEmail
                    key={scheduledEmail.id}
                    scheduledEmail={scheduledEmail}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    notificationChannels={notificationChannels}
                />
            ))}
        </>
    );
};
