// (C) 2021 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";

import { ListMode } from "../types.js";
import { messages } from "../locales.js";

export interface IUsersListEmptyProps {
    mode: ListMode;
}

export const UsersListEmpty: React.FC<IUsersListEmptyProps> = ({ mode }) => {
    const intl = useIntl();
    return (
        <div className="gd-share-dialog-grantee-list-empty-selection s-user-management-empty-selection gd-user-management-dialog-list-empty">
            <span>
                {mode === "VIEW" && intl.formatMessage(messages.viewUserListEmpty)}
                {mode === "EDIT" && intl.formatMessage(messages.editUserListEmpty)}
            </span>
        </div>
    );
};
