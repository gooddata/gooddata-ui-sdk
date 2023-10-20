// (C) 2021 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { GroupsListMode } from "../types.js";

/**
 * @internal
 */
export interface IGroupsListEmptyProps {
    mode: GroupsListMode;
}

/**
 * @internal
 */
export const GroupsListEmpty: React.FC<IGroupsListEmptyProps> = ({mode}) => {
    return (
        <div className="gd-share-dialog-grantee-list-empty-selection s-gd-share-dialog-grantee-list-empty-selection gd-workspace-permission-empty">
            <span>
                {mode === "VIEW" && <FormattedMessage id="userGroupDialog.groups.emptySelection.view" values={{br: <br />}} />}
                {mode === "EDIT" && <FormattedMessage id="userGroupDialog.groups.emptySelection.edit" />}
            </span>
        </div>
    );
};
