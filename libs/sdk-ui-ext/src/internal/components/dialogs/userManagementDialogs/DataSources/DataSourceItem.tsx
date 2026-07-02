// (C) 2023-2026 GoodData Corporation

import { type ReactElement } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { IconDataSource } from "@gooddata/sdk-ui-kit";

import { type DataSourcePermissionSubject, type IGrantedDataSource } from "../types.js";
import { InheritedIcon } from "../Workspace/WorkspaceItem/InheritedIcon.js";

import { dataSourcePermissionMessages } from "./locales.js";
import { PermissionsDropdown } from "./PermissionsDropdown.js";
import { usePermissionsDropdownState } from "./usePermissionsDropdownState.js";

function DataSourceIcon() {
    return (
        <div className="gd-grantee-item-icon-left-background">
            <span className="gd-grantee-item-icon gd-grantee-item-icon-left">
                <IconDataSource />
            </span>
        </div>
    );
}

interface IGranularGranteeUserGroupItemProps {
    dataSource: IGrantedDataSource;
    subjectType: DataSourcePermissionSubject;
    onChange?: (grantee: IGrantedDataSource) => void;
    onDelete?: (grantee: IGrantedDataSource) => void;
    renderDataSourceIcon?: (dataSource: IGrantedDataSource) => ReactElement;
}

export function DataSourceItem({
    dataSource,
    subjectType,
    onChange,
    onDelete,
    renderDataSourceIcon,
}: IGranularGranteeUserGroupItemProps) {
    const { isDropdownOpen, toggleDropdown } = usePermissionsDropdownState();
    const intl = useIntl();
    // Data sources inherited via a user group cannot be revoked or edited at the subject level, so
    // they are rendered read-only: no permission dropdown, just the level and a lock marker.
    const isInherited = !!dataSource.isInherited;
    const itemClassName = cx("s-user-management-data-source-item", "gd-share-dialog-grantee-item", {
        "is-active": isDropdownOpen,
        "is-inherited": isInherited,
    });

    return (
        <div className={itemClassName}>
            {isInherited ? (
                <InheritedIcon tooltipMessage={intl.formatMessage(dataSourcePermissionMessages.inherited)} />
            ) : (
                <PermissionsDropdown
                    dataSource={dataSource}
                    subjectType={subjectType}
                    isDropdownOpen={isDropdownOpen}
                    toggleDropdown={toggleDropdown}
                    onChange={onChange}
                    onDelete={onDelete}
                    className="gd-grantee-granular-permission"
                />
            )}
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{dataSource.title}</div>
                {isInherited ? (
                    <div className="gd-grantee-content-label gd-grantee-content-email">
                        {intl.formatMessage(dataSourcePermissionMessages[dataSource.permission])}
                    </div>
                ) : null}
            </div>
            {renderDataSourceIcon ? renderDataSourceIcon(dataSource) : <DataSourceIcon />}
        </div>
    );
}
