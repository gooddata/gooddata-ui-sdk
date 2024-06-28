// (C) 2019-2024 GoodData Corporation
/* eslint-disable import/named,import/namespace */
import React, { useMemo, useState } from "react";
import { IAutomationRecipient, IOrganizationUser } from "@gooddata/sdk-model";
import sortBy from "lodash/sortBy.js";

import { RecipientsSelectRenderer } from "./RecipientsSelectRenderer.js";

interface IRecipientsSelectProps {
    /**
     * Users to select from
     */
    users: IOrganizationUser[];

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
     * Maximum number of recipients
     */
    maxRecipients?: number;
}

export const RecipientsSelect: React.FC<IRecipientsSelectProps> = (props) => {
    const { users, value, originalValue, onChange, allowEmptySelection, maxRecipients } = props;

    const [search, setSearch] = useState<string>();

    const options = useMemo(() => {
        const filteredUsers = search ? users?.filter((user) => matchUser(user, search)) : users;
        return sortBy(
            filteredUsers?.map(
                (user): IAutomationRecipient => ({
                    id: user.id,
                    email: user.email,
                    name: user.fullName,
                    type: "user",
                }),
            ) ?? [],
            "user.email",
        );
    }, [users, search]);

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
            isLoading={status === "loading" || status === "pending"}
            allowEmptySelection={allowEmptySelection}
            maxRecipients={maxRecipients}
        />
    );
};

function matchUser(user: IOrganizationUser, search: string) {
    const lowerCaseSearch = search.toLowerCase();
    const lowerCaseEmail = user.email?.toLowerCase();
    const lowerCaseName = user.fullName?.toLowerCase();
    const lowerCaseId = user.id?.toLowerCase();
    return (
        lowerCaseEmail?.includes(lowerCaseSearch) ||
        lowerCaseName?.includes(lowerCaseSearch) ||
        lowerCaseId?.includes(lowerCaseSearch)
    );
}
