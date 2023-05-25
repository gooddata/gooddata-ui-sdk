// (C) 2019-2020 GoodData Corporation
/* eslint-disable import/named,import/namespace */
import React, { useMemo, useState } from "react";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IUser } from "@gooddata/sdk-model";
import sortBy from "lodash/sortBy.js";

import { useWorkspaceUsers } from "../../useWorkspaceUsers.js";
import { IScheduleEmailExistingRecipient, IScheduleEmailRecipient } from "../../interfaces.js";

import { RecipientsSelectRenderer } from "./RecipientsSelectRenderer.js";

interface IRecipientsSelectProps {
    /**
     * Author of the scheduled email - is always recipient of the scheduled email.
     */
    author: IScheduleEmailRecipient;

    /**
     * Current user creating or editing the schedule
     */
    currentUser: IUser;

    /**
     * Currently selected recipients.
     */
    value: IScheduleEmailRecipient[];

    /**
     * Originally selected recipients of a edited schedule
     */
    originalValue: IScheduleEmailRecipient[];

    /**
     * Callback to be called, when recipients are changed.
     */
    onChange: (recipientEmails: IScheduleEmailRecipient[]) => void;

    /**
     * Callback to be called, when error occurs when loading the recipients.
     */
    onError?: (error: GoodDataSdkError) => void;

    /**
     * Has user canListUsersInProject permission?
     */
    canListUsersInProject?: boolean;

    /**
     * Is enableKPIDashboardScheduleRecipients feature flag turned on?
     */
    enableKPIDashboardScheduleRecipients?: boolean;

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the component MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to work with.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the component MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;

    /**
     * Allow to remove the last recipient
     */
    allowEmptySelection?: boolean;
}

export const RecipientsSelect: React.FC<IRecipientsSelectProps> = (props) => {
    const {
        backend,
        workspace,
        author,
        currentUser,
        value,
        originalValue,
        onChange,
        onError,
        canListUsersInProject,
        enableKPIDashboardScheduleRecipients,
        allowEmptySelection,
    } = props;

    const [search, setSearch] = useState<string>();
    const { result, status } = useWorkspaceUsers({ backend, workspace, search, onError });

    const options = useMemo(
        () => sortBy(result?.map((user): IScheduleEmailExistingRecipient => ({ user })) ?? [], "user.email"),
        [result],
    );

    return (
        <RecipientsSelectRenderer
            canListUsersInProject={canListUsersInProject}
            isMulti={enableKPIDashboardScheduleRecipients}
            options={options}
            value={value}
            originalValue={originalValue}
            onChange={onChange}
            author={author}
            currentUser={currentUser}
            onLoad={(queryOptions) => {
                setSearch(queryOptions?.search);
            }}
            isLoading={status === "loading" || status === "pending"}
            allowEmptySelection={allowEmptySelection}
        />
    );
};
