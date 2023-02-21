// (C) 2022-2023 GoodData Corporation

import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { AccessGranularPermission } from "@gooddata/sdk-model";

import { DialogModeType, GranteeItem, IGranteePermissionsPossibilities, IGranularGrantee } from "../types";
import { getGranularGranteeClassNameId } from "../utils";
import { granularPermissionMessageLabels } from "../../../../locales";

import { GranularPermissionsDropdownBody } from "./GranularPermissionsDropdownBody";
import { withBubble } from "../../../../Bubble";

interface IGranularPermissionsDropdownProps {
    grantee: IGranularGrantee;
    granteePossibilities: IGranteePermissionsPossibilities;
    isDropdownDisabled?: boolean;
    isDropdownOpen: boolean;
    toggleDropdown: () => void;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
    className: string;
    mode: DialogModeType;
}

export const GranularPermissionsDropdown: React.FC<IGranularPermissionsDropdownProps> = ({
    grantee,
    granteePossibilities,
    isDropdownDisabled,
    isDropdownOpen,
    toggleDropdown,
    onChange,
    onDelete,
    className,
    mode,
}) => {
    const intl = useIntl();

    const [selectedPermission, setSelectedPermission] = useState<AccessGranularPermission>(
        granteePossibilities.assign.effective,
    );
    const handleSetSelectedPermission = (permission: AccessGranularPermission) => {
        setSelectedPermission(permission);
    };

    const handleClick = useCallback(() => {
        if (!isDropdownDisabled) {
            toggleDropdown();
        }
    }, [isDropdownDisabled, toggleDropdown]);

    const granularGranteeClassName = getGranularGranteeClassNameId(grantee);
    const buttonValue = intl.formatMessage(granularPermissionMessageLabels[selectedPermission]);

    return (
        <div className={className}>
            <div
                className={cx(
                    "s-granular-permission-button",
                    "gd-granular-permission-button",
                    "dropdown-button",
                    granularGranteeClassName,
                    {
                        "is-active": isDropdownOpen,
                        "gd-icon-navigateup": !isDropdownDisabled && isDropdownOpen,
                        "gd-icon-navigatedown": !isDropdownDisabled && !isDropdownOpen,
                        disabled: isDropdownDisabled,
                        "gd-icon-right": !isDropdownDisabled,
                    },
                )}
                onClick={handleClick}
            >
                <div className="s-granular-permission-button-title gd-granular-permission-button-title">
                    {buttonValue}
                </div>
            </div>
            <GranularPermissionsDropdownBody
                alignTo={granularGranteeClassName}
                grantee={grantee}
                granteePossibilities={granteePossibilities}
                toggleDropdown={toggleDropdown}
                isShowDropdown={isDropdownOpen}
                onChange={onChange}
                onDelete={onDelete}
                selectedPermission={selectedPermission}
                handleSetSelectedPermission={handleSetSelectedPermission}
                mode={mode}
            />
        </div>
    );
};

export const GranularPermissionsDropdownWithBubble = withBubble(GranularPermissionsDropdown);
