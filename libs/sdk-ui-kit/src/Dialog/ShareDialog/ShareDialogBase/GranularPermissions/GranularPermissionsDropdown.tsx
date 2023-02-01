// (C) 2022-2023 GoodData Corporation

import React, { useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { AccessGranularPermission } from "@gooddata/sdk-model";

import { GranteeItem, IGranularGrantee } from "../types";
import { getGranularGranteeClassNameId } from "../utils";
import { Bubble, BubbleHoverTrigger } from "../../../../Bubble";
import { IAlignPoint } from "../../../../typings/positioning";
import { CurrentUserPermissions } from "../../types";
import { granularPermissionMessageLabels } from "../../../../locales";

import { GranularPermissionsDropdownBody } from "./GranularPermissionsDropdownBody";
import { getEffectivePermission } from "./permissionsLogic";

const alignPoints: IAlignPoint[] = [{ align: "cr cl" }];

interface IGranularPermissionsDropdownProps {
    grantee: IGranularGrantee;
    currentUserPermissions: CurrentUserPermissions;
    disabledDropdown?: boolean;
    isDropdownOpen: boolean;
    toggleDropdown: () => void;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularPermissionsDropdown: React.FC<IGranularPermissionsDropdownProps> = ({
    grantee,
    currentUserPermissions,
    disabledDropdown,
    isDropdownOpen,
    toggleDropdown,
    onChange,
    onDelete,
}) => {
    const intl = useIntl();

    const [selectedPermission, setSelectedPermission] = useState<AccessGranularPermission>(
        getEffectivePermission(grantee.permissions, grantee.inheritedPermissions),
    );
    const handleSetSelectedPermission = (permission: AccessGranularPermission) => {
        setSelectedPermission(permission);
    };

    const granularGranteeClassName = getGranularGranteeClassNameId(grantee);
    const buttonValue = intl.formatMessage(granularPermissionMessageLabels[selectedPermission]);

    return (
        <>
            {disabledDropdown ? (
                <BubbleHoverTrigger className="gd-grantee-granular-permission">
                    <div
                        className={cx(
                            "s-granular-permission-button",
                            "gd-granular-permission-button",
                            "dropdown-button",
                            granularGranteeClassName,
                            "disabled",
                        )}
                    >
                        <div className="s-granular-permission-button-title gd-granular-permission-button-title">
                            {buttonValue}
                        </div>
                    </div>
                    <Bubble alignPoints={alignPoints}>
                        {/* TODO: TNT-1284 Add tooltips logic */}
                        <div>Disabled</div>
                    </Bubble>
                </BubbleHoverTrigger>
            ) : (
                <>
                    <BubbleHoverTrigger className="gd-grantee-granular-permission">
                        <div
                            className={cx(
                                "s-granular-permission-button",
                                "gd-granular-permission-button",
                                "dropdown-button",
                                "gd-icon-right",
                                granularGranteeClassName,
                                {
                                    "is-active": isDropdownOpen,
                                    "gd-icon-navigateup": isDropdownOpen,
                                    "gd-icon-navigatedown": !isDropdownOpen,
                                },
                            )}
                            onClick={toggleDropdown}
                        >
                            <div className="s-granular-permission-button-title gd-granular-permission-button-title">
                                {buttonValue}
                            </div>
                        </div>
                    </BubbleHoverTrigger>
                    <GranularPermissionsDropdownBody
                        currentUserPermissions={currentUserPermissions}
                        alignTo={granularGranteeClassName}
                        grantee={grantee}
                        toggleDropdown={toggleDropdown}
                        isShowDropdown={isDropdownOpen}
                        onChange={onChange}
                        onDelete={onDelete}
                        selectedPermission={selectedPermission}
                        handleSetSelectedPermission={handleSetSelectedPermission}
                    />
                </>
            )}
        </>
    );
};
