// (C) 2021-2025 GoodData Corporation
import React from "react";

import { useIntl } from "react-intl";

import { messages } from "../locales.js";
import { ListMode, WorkspacePermissionSubject } from "../types.js";

export interface IDataSourceListEmptyProps {
    mode: ListMode;
    subjectType: WorkspacePermissionSubject;
}

export const DataSourceListEmpty: React.FC<IDataSourceListEmptyProps> = ({ mode, subjectType }) => {
    const intl = useIntl();
    return (
        <div className="gd-share-dialog-grantee-list-empty-selection s-user-management-empty-selection gd-user-management-dialog-list-empty">
            <span>
                {mode === "VIEW" &&
                    subjectType === "user" &&
                    intl.formatMessage(messages.viewUserDataSourceListEmpty)}
                {mode === "VIEW" &&
                    subjectType === "userGroup" &&
                    intl.formatMessage(messages.viewUserGroupDataSourceListEmpty)}
                {mode === "EDIT" && intl.formatMessage(messages.editDataSourceListEmpty)}
            </span>
        </div>
    );
};
