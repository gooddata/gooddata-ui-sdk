// (C) 2022 GoodData Corporation

import React, { useCallback, useState } from "react";
import { IDashboardPermissions } from "@gooddata/sdk-model";

import { GranularPermissions } from "./GranularPermissions";

import { GranteeItem, IGranularGrantee } from "../types";
import { getGranularGranteeClassNameId, getGranularGranteePermissionId } from "../utils";

import { DropdownButton } from "../../../../Dropdown";
import { useIntl } from "react-intl";

interface IGranularPermissionsDropdownBodyProps {
    grantee: IGranularGrantee;
    dashboardPermissions: IDashboardPermissions;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularPermissionsDropdownBody: React.FC<IGranularPermissionsDropdownBodyProps> = ({
    grantee,
    dashboardPermissions,
    onChange,
    onDelete,
}) => {
    const intl = useIntl();
    const [isShowDropdown, toggleShowDropdown] = React.useState(false);
    const toggleDropdown = useCallback(() => toggleShowDropdown(!isShowDropdown), [isShowDropdown]);

    const [selectedPermission, setSelectedPermission] = useState<string>(
        getGranularGranteePermissionId(grantee.permissions),
    );

    const handleSetSelectedPermission = (permission: string) => {
        setSelectedPermission(permission);
    };

    const granularGranteeClassName = getGranularGranteeClassNameId(grantee);

    return (
        <>
            <div className="gd-granular-permissions-dropdown">
                <DropdownButton
                    className={`gd-granular-permissions-dropdown-button ${granularGranteeClassName}`}
                    onClick={toggleDropdown}
                    isOpen={isShowDropdown}
                    value={intl.formatMessage({ id: selectedPermission })}
                />
            </div>
            <GranularPermissions
                dashboardPermissions={dashboardPermissions}
                alignTo={granularGranteeClassName}
                grantee={grantee}
                toggleDropdown={toggleDropdown}
                isShowDropdown={isShowDropdown}
                onChange={onChange}
                onDelete={onDelete}
                handleSetSelectedPermission={handleSetSelectedPermission}
            />
        </>
    );
};
