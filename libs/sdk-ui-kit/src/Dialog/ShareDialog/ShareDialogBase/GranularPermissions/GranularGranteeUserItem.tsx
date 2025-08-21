// (C) 2022-2025 GoodData Corporation

import React, { useCallback, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { GranularPermissionsDropdownWithBubble } from "./GranularPermissionsDropdown.js";
import { getGranteePossibilities } from "./permissionsLogic.js";
import { usePermissionsDropdownState } from "./usePermissionsDropdownState.js";
import { CurrentUserPermissions } from "../../types.js";
import { useShareDialogInteraction } from "../ComponentInteractionContext.js";
import { GranteeUserIcon } from "../GranteeIcons.js";
import { DialogModeType, GranteeItem, IGranularGranteeUser } from "../types.js";
import { getGranteeItemTestId, getGranteeLabel } from "../utils.js";

interface IGranularGranteeUserItemProps {
    grantee: IGranularGranteeUser;
    currentUserPermissions: CurrentUserPermissions;
    isSharedObjectLocked: boolean;
    isGranteeShareLoading: boolean;
    mode: DialogModeType;
    id?: string;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export function GranularGranteeUserItem(props: IGranularGranteeUserItemProps) {
    const {
        grantee,
        currentUserPermissions,
        isSharedObjectLocked,
        onChange,
        onDelete,
        mode,
        id,
        isGranteeShareLoading,
    } = props;
    const { email } = grantee;
    const { isDropdownOpen, toggleDropdown } = usePermissionsDropdownState();
    const { permissionsDropdownOpenInteraction } = useShareDialogInteraction();
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
                handleToggleDropdown={handleToggleDropdown}
                onChange={onChange}
                onDelete={onDelete}
                isDropdownDisabled={!granteePossibilities.change.enabled || isGranteeShareLoading}
                bubbleTextId={granteePossibilities.change.tooltip}
                className="gd-grantee-granular-permission"
                triggerClassName="gd-grantee-granular-permission-bubble-trigger"
                mode={mode}
                accessibilityConfig={{
                    ariaDescribedBy: id,
                }}
            />
            <div id={id} className="gd-grantee-content">
                <div className="gd-grantee-content-label">{label}</div>
                {renderSubtitle ? (
                    <div className="gd-grantee-content-label gd-grantee-content-email">{email}</div>
                ) : null}
            </div>
            <GranteeUserIcon />
        </div>
    );
}
