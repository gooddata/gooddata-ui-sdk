// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { WorkspaceAccessSourceValue } from "@gooddata/sdk-model";

import { RemoveIcon } from "../../RemoveIcon.js";
import { type IGrantedWorkspace } from "../../types.js";

import { getHumanReadablePermissionsTitle } from "./granularPermissionUtils.js";
import { InheritedIcon } from "./InheritedIcon.js";
import { workspaceGranularPermissionMessages } from "./locales.js";
import { usePermissionsDropdownState } from "./usePermissionsDropdownState.js";
import { WorkspaceIcon } from "./WorkspaceIcon.js";

interface IGranularPermissionsWorkspaceItemProps {
    workspace: IGrantedWorkspace;
    onDelete: (workspace: IGrantedWorkspace) => void;
    onClick?: (workspace: IGrantedWorkspace) => void;
}

export function GranularPermissionsWorkspaceItem({
    workspace,
    onDelete,
    onClick,
}: IGranularPermissionsWorkspaceItemProps) {
    const { isDropdownOpen } = usePermissionsDropdownState();
    const intl = useIntl();
    // Inherited workspaces (via a user group or a parent workspace) cannot be revoked or edited at
    // the subject level, so they are rendered read-only: no remove icon, no click-to-edit, just a marker.
    const isInherited = !!workspace.isInherited;
    const itemClassName = cx("s-user-management-workspace-item", "gd-share-dialog-grantee-item", {
        "is-active": isDropdownOpen,
        "is-inherited": isInherited,
    });
    const subtitle = getHumanReadablePermissionsTitle(workspace.permissions, intl);

    return (
        <div className={itemClassName}>
            {isInherited ? (
                <InheritedIcon
                    tooltipMessage={intl.formatMessage(
                        workspace.accessSource === WorkspaceAccessSourceValue.HIERARCHY
                            ? workspaceGranularPermissionMessages.inheritedFromHierarchy
                            : workspaceGranularPermissionMessages.inheritedFromGroup,
                    )}
                />
            ) : (
                <RemoveIcon
                    tooltipMessage={intl.formatMessage(workspaceGranularPermissionMessages.remove)}
                    onClick={() => onDelete(workspace)}
                />
            )}
            <div
                className="gd-grantee-content"
                onClick={isInherited ? undefined : () => onClick?.(workspace)}
            >
                <div className="gd-grantee-content-label">{workspace.title}</div>
                <div className="gd-grantee-content-label gd-grantee-content-email" title={subtitle}>
                    {subtitle}
                </div>
            </div>
            <WorkspaceIcon />
        </div>
    );
}
