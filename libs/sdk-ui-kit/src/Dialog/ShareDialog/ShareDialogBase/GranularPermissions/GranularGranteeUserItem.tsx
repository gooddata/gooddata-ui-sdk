// (C) 2022-2023 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { GranteeUserIcon } from "../GranteeIcons";
import { GranteeItem, IGranularGranteeUser } from "../types";
import { getGranteeItemTestId, getGranteeLabel } from "../utils";
import { CurrentUserPermissions } from "../../types";

import { GranularPermissionsDropdown } from "./GranularPermissionsDropdown";
import { usePermissionsDropdownState } from "./usePermissionsDropdownState";

interface IGranularGranteeUserItemProps {
    grantee: IGranularGranteeUser;
    currentUserPermissions: CurrentUserPermissions;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularGranteeUserItem: React.FC<IGranularGranteeUserItemProps> = (props) => {
    const { grantee, currentUserPermissions, onChange, onDelete } = props;
    const { email } = grantee;
    const { isDropdownOpen, toggleDropdown } = usePermissionsDropdownState();
    const intl = useIntl();
    const itemClassName = cx(
        { "s-share-dialog-current-user": grantee.isCurrentUser },
        "s-share-dialog-grantee-item",
        "gd-share-dialog-grantee-item",
        getGranteeItemTestId(grantee),
        { "is-active": isDropdownOpen },
    );

    const label = useMemo(() => {
        return getGranteeLabel(grantee, intl);
    }, [grantee, intl]);

    const renderSubtitle = useMemo(() => email && email !== label, [email, label]);

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
                {renderSubtitle && (
                    <div className="gd-grantee-content-label gd-grantee-content-email">{email}</div>
                )}
            </div>
            <GranteeUserIcon />
        </div>
    );
};
