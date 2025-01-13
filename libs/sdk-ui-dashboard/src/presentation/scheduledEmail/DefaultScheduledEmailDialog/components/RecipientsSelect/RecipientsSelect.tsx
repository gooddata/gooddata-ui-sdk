// (C) 2019-2025 GoodData Corporation
/* eslint-disable import/named,import/namespace */
import React, { useMemo, useState } from "react";
import {
    IAutomationExternalRecipient,
    IAutomationRecipient,
    INotificationChannelMetadataObject,
    IWorkspaceUser,
} from "@gooddata/sdk-model";
import sortBy from "lodash/sortBy.js";

import { convertUserToAutomationRecipient } from "../../../../../_staging/automation/index.js";
import { isEmail } from "../../utils/validate.js";

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
        allowEmptySelection,
        allowExternalRecipients,
        maxRecipients,
        className,
        notificationChannels,
        notificationChannelId,
    } = props;

    const [search, setSearch] = useState<string>();

    const options = useMemo(() => {
        const filteredUsers = search ? users?.filter((user) => matchUser(user, search)) : users;
        const mappedUsers = sortBy(filteredUsers?.map(convertUserToAutomationRecipient) ?? [], "user.email");

        // If there is no user found and the search is an email, add it as an external recipient
        // if external recipients are allowed
        if (search && mappedUsers.length === 0 && allowExternalRecipients && isEmail(search)) {
            mappedUsers.push(createUser(search));
        }

        return mappedUsers;
    }, [search, users, allowExternalRecipients]);

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
            allowEmptySelection={allowEmptySelection}
            allowExternalRecipients={allowExternalRecipients}
            maxRecipients={maxRecipients}
            className={className}
            notificationChannel={notificationChannel}
        />
    );
};

function matchUser(user: IWorkspaceUser, search: string) {
    const lowerCaseSearch = search.toLowerCase();
    const lowerCaseEmail = user.email?.toLowerCase();
    const lowerCaseName = user.fullName?.toLowerCase();
    const lowerCaseId = user.login.toLowerCase();
    return (
        lowerCaseEmail?.includes(lowerCaseSearch) ||
        lowerCaseName?.includes(lowerCaseSearch) ||
        lowerCaseId?.includes(lowerCaseSearch)
    );
}

function createUser(search: string): IAutomationExternalRecipient {
    return {
        id: search,
        email: search,
        name: search,
        type: "externalUser",
    };
}
