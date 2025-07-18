// (C) 2023-2025 GoodData Corporation
import { useIntl } from "react-intl";

import { ListMode } from "../types.js";
import { messages } from "../locales.js";

export interface IUserGroupsListEmptyProps {
    mode: ListMode;
}

export function UserGroupsListEmpty({ mode }: IUserGroupsListEmptyProps) {
    const intl = useIntl();
    return (
        <div className="gd-share-dialog-grantee-list-empty-selection s-user-management-empty-selection gd-user-management-dialog-list-empty">
            <span>
                {mode === "VIEW" && intl.formatMessage(messages.viewUserGroupListEmpty)}
                {mode === "EDIT" && intl.formatMessage(messages.editUserGroupListEmpty)}
            </span>
        </div>
    );
}
