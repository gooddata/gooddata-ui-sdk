// (C) 2022-2023 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { GranteeGroupIcon } from "../GranteeIcons";
import { GranteeItem, IGranularGranteeGroup } from "../types";
import { getGranteeItemTestId, getGranteeLabel } from "../utils";
import { CurrentUserPermissions } from "../../types";

import { GranularPermissionsDropdownWithBubble } from "./GranularPermissionsDropdown";
import { usePermissionsDropdownState } from "./usePermissionsDropdownState";
import { getGranteePossibilities } from "./permissionsLogic";

interface IGranularGranteeGroupItemProps {
    grantee: IGranularGranteeGroup;
    currentUserPermissions: CurrentUserPermissions;
    isDashboardLocked: boolean;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularGranteeGroupItem: React.FC<IGranularGranteeGroupItemProps> = (props) => {
    const { grantee, currentUserPermissions, isDashboardLocked, onChange, onDelete } = props;
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
    const granteePossibilities = useMemo(
        () => getGranteePossibilities(grantee, currentUserPermissions, isDashboardLocked),
        [grantee, currentUserPermissions, isDashboardLocked],
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
            </div>
            <GranteeGroupIcon />
        </div>
    );
};
