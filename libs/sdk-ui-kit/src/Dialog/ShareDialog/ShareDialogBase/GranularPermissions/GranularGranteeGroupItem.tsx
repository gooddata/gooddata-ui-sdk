// (C) 2022-2023 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { GranteeGroupIcon } from "../GranteeIcons.js";
import { DialogModeType, GranteeItem, IGranularGranteeGroup } from "../types.js";
import { getGranteeItemTestId, getGranteeLabel } from "../utils.js";
import { CurrentUserPermissions } from "../../types.js";

import { GranularPermissionsDropdownWithBubble } from "./GranularPermissionsDropdown.js";
import { usePermissionsDropdownState } from "./usePermissionsDropdownState.js";
import { getGranteePossibilities } from "./permissionsLogic.js";
import { useShareDialogInteraction } from "../ComponentInteractionContext.js";

interface IGranularGranteeGroupItemProps {
    grantee: IGranularGranteeGroup;
    currentUserPermissions: CurrentUserPermissions;
    isSharedObjectLocked: boolean;
    mode: DialogModeType;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularGranteeGroupItem: React.FC<IGranularGranteeGroupItemProps> = (props) => {
    const { grantee, currentUserPermissions, isSharedObjectLocked, onChange, onDelete, mode } = props;
    const { isDropdownOpen, toggleDropdown } = usePermissionsDropdownState();
    const { permissionsDropdownOpenInteraction } = useShareDialogInteraction();
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
        () => getGranteePossibilities(grantee, currentUserPermissions, isSharedObjectLocked),
        [grantee, currentUserPermissions, isSharedObjectLocked],
    );

    const handleToggleDropdown = useCallback(() => {
        toggleDropdown();

        if (!isDropdownOpen) {
            permissionsDropdownOpenInteraction(
                grantee,
                mode === "ShareGrantee",
                granteePossibilities.assign.effective,
            );
        }
    }, [
        toggleDropdown,
        isDropdownOpen,
        grantee,
        mode,
        permissionsDropdownOpenInteraction,
        granteePossibilities,
    ]);

    return (
        <div className={itemClassName}>
            <GranularPermissionsDropdownWithBubble
                grantee={grantee}
                granteePossibilities={granteePossibilities}
                isDropdownOpen={isDropdownOpen}
                toggleDropdown={handleToggleDropdown}
                onChange={onChange}
                onDelete={onDelete}
                isDropdownDisabled={!granteePossibilities.change.enabled}
                bubbleTextId={granteePossibilities.change.tooltip}
                className="gd-grantee-granular-permission"
                triggerClassName="gd-grantee-granular-permission-bubble-trigger"
                mode={mode}
            />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{label}</div>
            </div>
            <GranteeGroupIcon />
        </div>
    );
};
