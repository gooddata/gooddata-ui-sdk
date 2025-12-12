// (C) 2021-2025 GoodData Corporation

import { useIntl } from "react-intl";

import { messages } from "../locales.js";
import { type ListMode } from "../types.js";

export interface IUsersListEmptyProps {
    mode: ListMode;
}

export function UsersListEmpty({ mode }: IUsersListEmptyProps) {
    const intl = useIntl();
    return (
        <div className="gd-share-dialog-grantee-list-empty-selection s-user-management-empty-selection gd-user-management-dialog-list-empty">
            <span>
                {mode === "VIEW" && intl.formatMessage(messages.viewUserListEmpty)}
                {mode === "EDIT" && intl.formatMessage(messages.editUserListEmpty)}
            </span>
        </div>
    );
}
