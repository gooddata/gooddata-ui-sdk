// (C) 2023 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";

import { ListMode } from "../types.js";
import { userManagementMessages } from "../../../locales.js";

export interface IUserGroupsListEmptyProps {
    mode: ListMode;
}

export const UserGroupsListEmpty: React.FC<IUserGroupsListEmptyProps> = ({ mode }) => {
    const intl = useIntl();
    return (
        <div className="gd-share-dialog-grantee-list-empty-selection s-user-management-empty-selection gd-user-management-dialog-list-empty">
            <span>
                {mode === "VIEW" && intl.formatMessage(userManagementMessages.viewUserGroupListEmpty)}
                {mode === "EDIT" && intl.formatMessage(userManagementMessages.editUserGroupListEmpty)}
            </span>
        </div>
    );
};
