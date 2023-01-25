// (C) 2022-2023 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { GranteeGroupIcon } from "../GranteeIcons";
import { GranteeItem, IGranularGrantee } from "../types";
import { getGranteeItemTestId, getGranteeLabel } from "../utils";
import { CurrentUserPermissions } from "../../types";

import { GranularPermissionsDropdown } from "./GranularPermissionsDropdown";
import { usePermissionsDropdown } from "./usePermissionsDropdown";

interface IGranularGranteeGroupItemProps {
    grantee: IGranularGrantee;
    currentUserPermissions: CurrentUserPermissions;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularGranteeGroupItem: React.FC<IGranularGranteeGroupItemProps> = (props) => {
    const { grantee, currentUserPermissions, onChange, onDelete } = props;
    const { isDropdownOpen, toggleDropdown } = usePermissionsDropdown();

    const intl = useIntl();
    const groupName = useMemo(() => getGranteeLabel(grantee, intl), [grantee, intl]);
    const itemClassName = cx(
        "s-share-dialog-grantee-item",
        "gd-share-dialog-grantee-item",
        getGranteeItemTestId(grantee),
        {
            "is-active": isDropdownOpen,
        },
    );

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
                <div className="gd-grantee-content-label">{groupName}</div>
            </div>
            <GranteeGroupIcon />
        </div>
    );
};
