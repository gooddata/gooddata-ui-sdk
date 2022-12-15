// (C) 2022 GoodData Corporation

import React, { useCallback, useState } from "react";
import { IDashboardPermissions } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";

import { GranularPermissions } from "./GranularPermissions";

import { GranteeItem, IGranularGrantee } from "../types";
import { getGranularGranteeClassNameId, getGranularGranteePermissionId } from "../utils";

import { DropdownButton } from "../../../../Dropdown";
import { Bubble, BubbleHoverTrigger } from "../../../../Bubble";
import { IAlignPoint } from "../../../../typings/positioning";

const alignPoints: IAlignPoint[] = [{ align: "cr cl" }];

interface IGranularPermissionsDropdownBodyProps {
    grantee: IGranularGrantee;
    dashboardPermissions: IDashboardPermissions;
    disabledDropdown?: boolean;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularPermissionsDropdownBody: React.FC<IGranularPermissionsDropdownBodyProps> = ({
    grantee,
    dashboardPermissions,
    disabledDropdown = false,
    onChange,
    onDelete,
}) => {
    const intl = useIntl();
    const [isShowDropdown, toggleShowDropdown] = React.useState<boolean>(false);
    const toggleDropdown = useCallback(() => toggleShowDropdown(!isShowDropdown), [isShowDropdown]);

    const [selectedPermission, setSelectedPermission] = useState<string>(
        getGranularGranteePermissionId(grantee.permissions),
    );

    const handleSetSelectedPermission = (permission: string) => {
        setSelectedPermission(permission);
    };

    const granularGranteeClassName = getGranularGranteeClassNameId(grantee);
    const buttonValue = intl.formatMessage({ id: selectedPermission });

    return (
        <div className="gd-granular-permissions-dropdown">
            {disabledDropdown ? (
                <BubbleHoverTrigger>
                    <DropdownButton
                        disabled
                        className={`gd-granular-permissions-dropdown-button ${granularGranteeClassName}`}
                        value={buttonValue}
                    />
                    {/* TODO: Update text */}
                    <Bubble alignPoints={alignPoints}>
                        <div> disabled tooltip </div>
                    </Bubble>
                </BubbleHoverTrigger>
            ) : (
                <>
                    <DropdownButton
                        className={`gd-granular-permissions-dropdown-button ${granularGranteeClassName}`}
                        onClick={toggleDropdown}
                        isOpen={isShowDropdown}
                        value={buttonValue}
                    />
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
            )}
        </div>
    );
};
