// (C) 2019-2026 GoodData Corporation

import { type KeyboardEvent, useMemo } from "react";

import { sortBy } from "lodash-es";

import {
    type IAutomationRecipient,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";
import { DETAILED_ANNOUNCEMENT_THRESHOLD, UiSearchResultsAnnouncement } from "@gooddata/sdk-ui-kit";

import { convertUserToAutomationRecipient } from "../../../../shared/utils/automationUtils.js";
import { createUser, matchRecipient } from "../../../utils/users.js";
import { isEmail } from "../../../utils/validate.js";

import { RecipientsSelectRenderer } from "./RecipientsSelectRenderer.js";
import { useWorkspaceUsersSearch } from "./useWorkspaceUsersSearch.js";

interface IRecipientsSelectProps {
    /**
     * Currently selected recipients.
     */
    value: IAutomationRecipient[];

    /**
     * Callback to be called, when recipients are changed.
     */
    onChange: (recipientEmails: IAutomationRecipient[]) => void;

    /**
     * Currently logged in user as a recipient
     */
    loggedUser?: IAutomationRecipient;

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

export function RecipientsSelect({
    id,
    value,
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
}: IRecipientsSelectProps) {
    const isServerSearch = !externalRecipientOverride && !allowOnlyLoggedUserRecipients;
    const { search, users, usersError, isLoading, onSearch, onActivate } = useWorkspaceUsersSearch({
        enabled: isServerSearch,
    });

    const notificationChannel = notificationChannels?.find((channel) => channel.id === notificationChannelId);

    const options = useMemo(() => {
        if (externalRecipientOverride) {
            return search && isEmail(search) && allowExternalRecipients ? [createUser(search)] : [];
        }

        const mappedUsers = allowOnlyLoggedUserRecipients
            ? loggedUser && matchRecipient(loggedUser, search)
                ? [loggedUser]
                : []
            : sortBy((users ?? []).map(convertUserToAutomationRecipient), "email");

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

    const hasSettledResults = !isLoading && (isServerSearch ? users !== undefined : Boolean(search));

    const announcedResultValues = useMemo(
        () => options.slice(0, DETAILED_ANNOUNCEMENT_THRESHOLD).map((option) => option.name ?? option.id),
        [options],
    );

    return (
        <>
            <UiSearchResultsAnnouncement
                totalResults={hasSettledResults ? options.length : undefined}
                resultValues={announcedResultValues}
            />
            <RecipientsSelectRenderer
                id={id}
                canListUsersInProject
                isMulti
                options={options}
                value={value}
                onChange={onChange}
                onSearch={onSearch}
                onActivate={onActivate}
                isLoading={isLoading}
                loggedUser={loggedUser}
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
        </>
    );
}
