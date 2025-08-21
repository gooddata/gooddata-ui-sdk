// (C) 2023-2025 GoodData Corporation

import React, { ReactElement } from "react";

import cx from "classnames";

import { Icon } from "@gooddata/sdk-ui-kit";

import { PermissionsDropdown } from "./PermissionsDropdown.js";
import { usePermissionsDropdownState } from "./usePermissionsDropdownState.js";
import { DataSourcePermissionSubject, IGrantedDataSource } from "../types.js";

function DataSourceIcon() {
    return (
        <div className="gd-grantee-item-icon-left-background">
            <span className="gd-grantee-item-icon gd-grantee-item-icon-left">
                <Icon.DataSource />
            </span>
        </div>
    );
}

interface IGranularGranteeUserGroupItemProps {
    dataSource: IGrantedDataSource;
    subjectType: DataSourcePermissionSubject;
    onChange: (grantee: IGrantedDataSource) => void;
    onDelete: (grantee: IGrantedDataSource) => void;
    renderDataSourceIcon: (dataSource: IGrantedDataSource) => ReactElement;
}

export function DataSourceItem({
    dataSource,
    subjectType,
    onChange,
    onDelete,
    renderDataSourceIcon,
}: IGranularGranteeUserGroupItemProps) {
    const { isDropdownOpen, toggleDropdown } = usePermissionsDropdownState();
    const itemClassName = cx("s-user-management-data-source-item", "gd-share-dialog-grantee-item", {
        "is-active": isDropdownOpen,
    });

    return (
        <div className={itemClassName}>
            <PermissionsDropdown
                dataSource={dataSource}
                subjectType={subjectType}
                isDropdownOpen={isDropdownOpen}
                toggleDropdown={toggleDropdown}
                onChange={onChange}
                onDelete={onDelete}
                className="gd-grantee-granular-permission"
            />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{dataSource.title}</div>
            </div>
            {renderDataSourceIcon ? renderDataSourceIcon(dataSource) : <DataSourceIcon />}
        </div>
    );
}
