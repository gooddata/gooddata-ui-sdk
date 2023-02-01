// (C) 2022-2023 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { GranteeGroupIcon } from "../GranteeIcons";
import { GranteeItem, IGranularGranteeGroup } from "../types";
import { getGranteeItemTestId, getGranteeLabel } from "../utils";
import { CurrentUserPermissions } from "../../types";

import { GranularPermissionsDropdown } from "./GranularPermissionsDropdown";
import { usePermissionsDropdownState } from "./usePermissionsDropdownState";

interface IGranularGranteeGroupItemProps {
    grantee: IGranularGranteeGroup;
    currentUserPermissions: CurrentUserPermissions;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularGranteeGroupItem: React.FC<IGranularGranteeGroupItemProps> = (props) => {
    const { grantee, currentUserPermissions, onChange, onDelete } = props;
    const { isDropdownOpen, toggleDropdown } = usePermissionsDropdownState();
    const intl = useIntl();

    const itemClassName = cx(
        "s-share-dialog-grantee-item",
        "gd-share-dialog-grantee-item",
        getGranteeItemTestId(grantee),
        {
            "is-active": isDropdownOpen,
        },
    );

    const label = useMemo(() => getGranteeLabel(grantee, intl), [grantee, intl]);
    return (
        <div className={itemClassName}>
            <GranularPermissionsDropdown
                currentUserPermissions={currentUserPermissions}
                grantee={grantee}
                isDropdownOpen={isDropdownOpen}
                toggleDropdown={toggleDropdown}
                onChange={onChange}
                onDelete={onDelete}
            />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{label}</div>
            </div>
            <GranteeGroupIcon />
        </div>
    );
};
