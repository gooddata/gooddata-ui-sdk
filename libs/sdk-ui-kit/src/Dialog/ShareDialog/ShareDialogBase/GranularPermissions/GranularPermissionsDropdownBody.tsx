// (C) 2022 GoodData Corporation

import React, { useCallback } from "react";

import { GranularPermissions } from "./GranularPermissions";

import { GranteeItem } from "../types";
import { getGranularGranteeClassNameId } from "../utils";

import { DropdownButton } from "../../../../Dropdown";

interface IGranularPermissionsDropdownBodyProps {
    grantee: GranteeItem;
    value: string;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularPermissionsDropdownBody: React.FC<IGranularPermissionsDropdownBodyProps> = ({
    grantee,
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
