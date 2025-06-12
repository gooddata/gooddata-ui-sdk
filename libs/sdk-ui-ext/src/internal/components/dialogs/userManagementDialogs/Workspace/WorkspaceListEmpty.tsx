// (C) 2021 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";

import { ListMode, WorkspacePermissionSubject } from "../types.js";
import { messages } from "../locales.js";

export interface IWorkspaceListEmptyProps {
    mode: ListMode;
    subjectType: WorkspacePermissionSubject;
}

export const WorkspaceListEmpty: React.FC<IWorkspaceListEmptyProps> = ({ mode, subjectType }) => {
    const intl = useIntl();
    return (
        <div className="gd-share-dialog-grantee-list-empty-selection s-user-management-empty-selection gd-user-management-dialog-list-empty">
            <span>
                {mode === "VIEW" &&
                    subjectType === "user" &&
                    intl.formatMessage(messages.viewUserWorkspaceListEmpty)}
                {mode === "VIEW" &&
                    subjectType === "userGroup" &&
                    intl.formatMessage(messages.viewUserGroupWorkspaceListEmpty)}
                {mode === "EDIT" && intl.formatMessage(messages.editWorkspaceListEmpty)}
            </span>
        </div>
    );
};
