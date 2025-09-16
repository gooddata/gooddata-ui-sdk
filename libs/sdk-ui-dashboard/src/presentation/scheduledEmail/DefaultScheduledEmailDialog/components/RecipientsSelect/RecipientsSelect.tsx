// (C) 2019-2025 GoodData Corporation

import { KeyboardEvent, useMemo, useState } from "react";

import sortBy from "lodash/sortBy.js";

import {
    IAutomationRecipient,
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    IWorkspaceUser,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { RecipientsSelectRenderer } from "./RecipientsSelectRenderer.js";
import { convertUserToAutomationRecipient } from "../../../../../_staging/automation/index.js";
import { createUser, matchUser } from "../../../utils/users.js";
import { isEmail } from "../../../utils/validate.js";

interface IRecipientsSelectProps {
    /**
     * Users to select from
     */
    users: IWorkspaceUser[];

    /**
     * Error occurred while loading users
     */
    usersError?: GoodDataSdkError;

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
    notificationChannels?: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];

    /**
     * Notification channel id
     */
    notificationChannelId?: string;

    /**
     * Show label?
     */
    showLabel?: boolean;

    /**
     * Id
     */
    id: string;

    /**
     * Handle keyboard submit
     */
    onKeyDownSubmit?: (e: KeyboardEvent) => void;

    /**
     * Override recipients with an external recipient
     */
    externalRecipientOverride?: string;
}

export function RecipientsSelect(props: IRecipientsSelectProps) {
    const {
        id,
        users,
        usersError,
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
        showLabel = true,
        onKeyDownSubmit,
        externalRecipientOverride,
    } = props;

    const [search, setSearch] = useState<string>();

    const notificationChannel = useMemo(() => {
        return notificationChannels?.find((channel) => channel.id === notificationChannelId);
    }, [notificationChannelId, notificationChannels]);

    const options = useMemo(() => {
        if (externalRecipientOverride) {
            return search && isEmail(search) && allowExternalRecipients ? [createUser(search)] : [];
        }

        const validUsers = [
            ...(allowOnlyLoggedUserRecipients ? [] : users),
            ...(allowOnlyLoggedUserRecipients && loggedUser ? [loggedUser] : []),
        ];
        const filteredUsers = search ? validUsers.filter((user) => matchUser(user, search)) : validUsers;
        const mappedUsers = sortBy(filteredUsers?.map(convertUserToAutomationRecipient) ?? [], "user.email");

        // If there is no user found and the search is an email, add it as an external recipient
        if (search && mappedUsers.length === 0 && isEmail(search) && allowExternalRecipients) {
            mappedUsers.push(createUser(search));
        }

        return mappedUsers;
    }, [
        allowOnlyLoggedUserRecipients,
        loggedUser,
        search,
        users,
        allowExternalRecipients,
        externalRecipientOverride,
    ]);

    return (
        <RecipientsSelectRenderer
            id={id}
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
            usersError={usersError}
            showLabel={showLabel}
            onKeyDownSubmit={onKeyDownSubmit}
            externalRecipientOverride={externalRecipientOverride}
        />
    );
}
