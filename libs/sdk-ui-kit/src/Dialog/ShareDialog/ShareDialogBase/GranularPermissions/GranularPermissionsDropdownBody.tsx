// (C) 2022 GoodData Corporation

import React, { useCallback } from "react";
import { IDashboardPermissions } from "@gooddata/sdk-model";

import { GranularPermissions } from "./GranularPermissions";

import { GranteeItem, IGranularGrantee } from "../types";
import { getGranularGranteeClassNameId } from "../utils";

import { DropdownButton } from "../../../../Dropdown";

interface IGranularPermissionsDropdownBodyProps {
    grantee: IGranularGrantee;
    value: string;
    dashboardPermissions: IDashboardPermissions;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularPermissionsDropdownBody: React.FC<IGranularPermissionsDropdownBodyProps> = ({
    grantee,
    dashboardPermissions,
    value,
    onChange,
    onDelete,
}) => {
    const [isShowDropdown, toggleShowDropdown] = React.useState(false);
    const toggleDropdown = useCallback(() => toggleShowDropdown(!isShowDropdown), [isShowDropdown]);

    const granularGranteeClassName = getGranularGranteeClassNameId(grantee);

    return (
        <>
            <div className="gd-granular-permissions-dropdown">
                <DropdownButton
                    className={granularGranteeClassName}
                    onClick={toggleDropdown}
                    isOpen={isShowDropdown}
                    value={value}
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
            />
        </>
    );
};
