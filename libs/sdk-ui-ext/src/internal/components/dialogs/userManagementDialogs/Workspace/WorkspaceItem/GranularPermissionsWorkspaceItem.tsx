// (C) 2024 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { IGrantedWorkspace } from "../../types.js";
import { RemoveIcon } from "../../RemoveIcon.js";
import { usePermissionsDropdownState } from "./usePermissionsDropdownState.js";
import { WorkspaceIcon } from "./WorkspaceIcon.js";
import { workspaceGranularPermissionMessages } from "./locales.js";
import { getHumanReadablePermissionsTitle } from "./granularPermissionUtils.js";

interface IGranularPermissionsWorkspaceItemProps {
    workspace: IGrantedWorkspace;
    onDelete: (workspace: IGrantedWorkspace) => void;
    onClick?: (workspace: IGrantedWorkspace) => void;
}

export const GranularPermissionsWorkspaceItem: React.FC<IGranularPermissionsWorkspaceItemProps> = ({
    workspace,
    onDelete,
    onClick,
}) => {
    const { isDropdownOpen } = usePermissionsDropdownState();
    const intl = useIntl();
    const itemClassName = cx("s-user-management-workspace-item", "gd-share-dialog-grantee-item", {
        "is-active": isDropdownOpen,
    });
    const subtitle = getHumanReadablePermissionsTitle(workspace.permissions, intl);

    return (
        <div className={itemClassName}>
            <RemoveIcon
                tooltipMessage={intl.formatMessage(workspaceGranularPermissionMessages.remove)}
                onClick={() => onDelete(workspace)}
            />
            <div className="gd-grantee-content" onClick={() => onClick?.(workspace)}>
                <div className="gd-grantee-content-label">{workspace.title}</div>
                <div className="gd-grantee-content-label gd-grantee-content-email" title={subtitle}>
                    {subtitle}
                </div>
            </div>
            <WorkspaceIcon />
        </div>
    );
};
