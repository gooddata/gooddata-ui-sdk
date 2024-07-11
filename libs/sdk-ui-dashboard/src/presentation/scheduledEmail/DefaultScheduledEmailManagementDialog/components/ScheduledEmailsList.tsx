// (C) 2022-2024 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { IAutomationMetadataObject, IWebhookMetadataObject } from "@gooddata/sdk-model";
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { ScheduledEmail } from "./ScheduledEmail.js";

interface IScheduledEmailsProps {
    onDelete: (scheduledEmail: IAutomationMetadataObject) => void;
    onEdit: (scheduledEmail: IAutomationMetadataObject) => void;
    isLoading: boolean;
    scheduledEmails: IAutomationMetadataObject[];
    currentUserEmail?: string;
    noSchedulesMessageId: string;
    webhooks: IWebhookMetadataObject[];
}

export const ScheduledEmails: React.FC<IScheduledEmailsProps> = (props) => {
    const { isLoading, scheduledEmails, onDelete, onEdit, noSchedulesMessageId, webhooks } = props;
    const theme = useTheme();

    if (isLoading) {
        return (
            <div className="gd-loading-equalizer-wrap gd-scheduled-emails-message">
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
                    key={scheduledEmail.id}
                    scheduledEmail={scheduledEmail}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    webhooks={webhooks}
                />
            ))}
        </>
    );
};
