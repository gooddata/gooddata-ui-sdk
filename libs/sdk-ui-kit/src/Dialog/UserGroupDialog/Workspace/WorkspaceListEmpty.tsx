// (C) 2021 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { WorkspaceListMode } from "../types.js";

/**
 * @internal
 */
export interface IWorkspaceListEmptyProps {
    mode: WorkspaceListMode;
}

/**
 * @internal
 */
export const WorkspaceListEmpty: React.FC<IWorkspaceListEmptyProps> = ({mode}) => {
    return (
        <div className="gd-share-dialog-grantee-list-empty-selection s-gd-share-dialog-grantee-list-empty-selection gd-workspace-permission-empty">
            <span>
                {mode === "VIEW" && <FormattedMessage id="userGroupDialog.workspace.emptySelection.view" values={{br: <br />}} />}
                {mode === "EDIT" && <FormattedMessage id="userGroupDialog.workspace.emptySelection.edit" />}
            </span>
        </div>
    );
};
