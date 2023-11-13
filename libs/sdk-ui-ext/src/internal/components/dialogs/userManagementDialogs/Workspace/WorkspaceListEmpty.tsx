// (C) 2021 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";

import { ListMode } from "../types.js";
import { messages } from "../locales.js";

export interface IWorkspaceListEmptyProps {
    mode: ListMode;
}

export const WorkspaceListEmpty: React.FC<IWorkspaceListEmptyProps> = ({ mode }) => {
    const intl = useIntl();
    return (
        <div className="gd-share-dialog-grantee-list-empty-selection s-user-management-empty-selection gd-user-management-dialog-list-empty">
            <span>
                {mode === "VIEW" && intl.formatMessage(messages.viewWorkspaceListEmpty)}
                {mode === "EDIT" && intl.formatMessage(messages.editWorkspaceListEmpty)}
            </span>
        </div>
    );
};
