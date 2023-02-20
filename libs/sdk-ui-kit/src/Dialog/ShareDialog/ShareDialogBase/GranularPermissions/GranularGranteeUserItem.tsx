// (C) 2022-2023 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { GranteeUserIcon } from "../GranteeIcons";
import { GranteeItem, IGranularGranteeUser } from "../types";
import { getGranteeItemTestId, getGranteeLabel } from "../utils";
import { CurrentUserPermissions } from "../../types";

import { GranularPermissionsDropdownWithBubble } from "./GranularPermissionsDropdown";
import { usePermissionsDropdownState } from "./usePermissionsDropdownState";
import { getGranteePossibilities } from "./permissionsLogic";

interface IGranularGranteeUserItemProps {
    grantee: IGranularGranteeUser;
    currentUserPermissions: CurrentUserPermissions;
    isSharedObjectLocked: boolean;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularGranteeUserItem: React.FC<IGranularGranteeUserItemProps> = (props) => {
    const { grantee, currentUserPermissions, isSharedObjectLocked, onChange, onDelete } = props;
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

    const granteePossibilities = useMemo(
        () => getGranteePossibilities(grantee, currentUserPermissions, isSharedObjectLocked),
        [grantee, currentUserPermissions, isSharedObjectLocked],
    );

    return (
        <div className={itemClassName}>
            <GranularPermissionsDropdownWithBubble
                grantee={grantee}
                granteePossibilities={granteePossibilities}
                isDropdownOpen={isDropdownOpen}
                toggleDropdown={toggleDropdown}
                onChange={onChange}
                onDelete={onDelete}
                isDropdownDisabled={!granteePossibilities.change.enabled}
                bubbleTextId={granteePossibilities.change.tooltip}
                className="gd-grantee-granular-permission"
                triggerClassName="gd-grantee-granular-permission-bubble-trigger"
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
