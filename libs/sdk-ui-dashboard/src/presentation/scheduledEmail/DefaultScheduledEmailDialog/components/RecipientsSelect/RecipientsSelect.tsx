// (C) 2019-2025 GoodData Corporation
/* eslint-disable import/named,import/namespace */
import React, { useMemo, useState } from "react";
import {
    IAutomationRecipient,
    INotificationChannelMetadataObject,
    IWorkspaceUser,
} from "@gooddata/sdk-model";
import sortBy from "lodash/sortBy.js";

import { convertUserToAutomationRecipient } from "../../../../../_staging/automation/index.js";
import { createUser, matchUser } from "../../../utils/users.js";

import { RecipientsSelectRenderer } from "./RecipientsSelectRenderer.js";

interface IRecipientsSelectProps {
    /**
     * Users to select from
     */
    users: IWorkspaceUser[];

    /**
     * Currently selected recipients.
     */
    value: IAutomationRecipient[];

    /**
     * Originally selected recipients of a edited schedule
     */
    originalValue: IAutomationRecipient[];

    /**
     * Callback to be called, when recipients are changed.
     */
    onChange: (recipientEmails: IAutomationRecipient[]) => void;

    /**
     * Currently logged in user as a recipient
     */
    loggedUser?: IWorkspaceUser;

    /**
     * Allow to select only me as a recipient
     */
    allowOnlyLoggedUserRecipients?: boolean;
    /**
     * Allow to remove the last recipient
     */
    allowEmptySelection?: boolean;

    /**
     * Allow to select external recipients
     */
    allowExternalRecipients?: boolean;

    /**
     * Maximum number of recipients
     */
    maxRecipients?: number;

    /**
     * Additional class name
     */
    className?: string;

    /**
     * Notification channels
     */
    notificationChannels?: INotificationChannelMetadataObject[];

    /**
     * Notification channel id
     */
    notificationChannelId?: string;
}

export const RecipientsSelect: React.FC<IRecipientsSelectProps> = (props) => {
    const {
        users,
        value,
        originalValue,
        onChange,
        loggedUser,
        allowEmptySelection,
        allowExternalRecipients,
        allowOnlyLoggedUserRecipients,
        maxRecipients,
        className,
        notificationChannels,
        notificationChannelId,
    } = props;

    const [search, setSearch] = useState<string>();

    const options = useMemo(() => {
        const validUsers = [
            ...(allowOnlyLoggedUserRecipients ? [] : users),
            ...(allowOnlyLoggedUserRecipients && loggedUser ? [loggedUser] : []),
        ];
        const filteredUsers = search ? validUsers.filter((user) => matchUser(user, search)) : validUsers;
        const mappedUsers = sortBy(filteredUsers?.map(convertUserToAutomationRecipient) ?? [], "user.email");

        // If there is no user found and the search is an email, add it as an external recipient
        if (search && mappedUsers.length === 0) {
            mappedUsers.push(createUser(search));
        }

        return mappedUsers;
    }, [allowOnlyLoggedUserRecipients, loggedUser, search, users]);

    const notificationChannel = useMemo(() => {
        return notificationChannels?.find((channel) => channel.id === notificationChannelId);
    }, [notificationChannelId, notificationChannels]);

    return (
        <RecipientsSelectRenderer
            canListUsersInProject
            isMulti
            options={options}
            value={value}
            originalValue={originalValue}
            onChange={onChange}
            onLoad={(queryOptions) => {
                setSearch(queryOptions?.search);
            }}
            loggedUser={loggedUser ? convertUserToAutomationRecipient(loggedUser) : undefined}
            allowOnlyLoggedUserRecipients={allowOnlyLoggedUserRecipients}
            allowEmptySelection={allowEmptySelection}
            allowExternalRecipients={allowExternalRecipients}
            maxRecipients={maxRecipients}
            className={className}
            notificationChannel={notificationChannel}
        />
    );
};
