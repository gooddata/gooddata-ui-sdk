// (C) 2022-2023 GoodData Corporation

import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { AccessGranularPermission } from "@gooddata/sdk-model";

import { GranularPermissionSelectItemWithBubble } from "./GranularPermissionItem.js";

import { DialogModeType, GranteeItem, IGranteePermissionsPossibilities, IGranularGrantee } from "../types.js";
import { ItemsWrapper, Separator } from "../../../../List/index.js";
import { Overlay } from "../../../../Overlay/index.js";
import { IAlignPoint } from "../../../../typings/positioning.js";
import { withBubble } from "../../../../Bubble/index.js";
import { granularPermissionMessageLabels } from "../../../../locales.js";
import { useShareDialogInteraction } from "../ComponentInteractionContext.js";

interface IGranularPermissionsDropdownBodyProps {
    alignTo: string;
    grantee: IGranularGrantee;
    granteePossibilities: IGranteePermissionsPossibilities;
    isShowDropdown: boolean;
    selectedPermission: AccessGranularPermission;
    toggleDropdown(): void;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
    handleSetSelectedPermission: (permission: AccessGranularPermission) => void;
    mode: DialogModeType;
}

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

const RemoveItem: React.FC<{ disabled: boolean; tooltipId: string; onClick: () => void }> = ({
    disabled,
    tooltipId,
    onClick,
}) => {
    const className = cx("gd-list-item gd-menu-item", "s-granular-permission-remove", {
        "is-disabled": disabled,
    });

    const FormattedMessageWithBubble = withBubble(FormattedMessage);

    return (
        <div className={className} onClick={onClick}>
            <FormattedMessageWithBubble
                id={granularPermissionMessageLabels.remove.id}
                showBubble={disabled}
                bubbleTextId={tooltipId}
            />
        </div>
    );
};

export const GranularPermissionsDropdownBody: React.FC<IGranularPermissionsDropdownBodyProps> = ({
    grantee,
    granteePossibilities,
    alignTo,
    isShowDropdown,
    selectedPermission,
    toggleDropdown,
    onChange,
    onDelete,
    handleSetSelectedPermission,
    mode,
}) => {
    const { permissionsChangeInteraction, permissionsRemoveInteraction } = useShareDialogInteraction();

    const handleOnDelete = useCallback(() => {
        if (granteePossibilities.remove.enabled) {
            const changedGrantee: GranteeItem = {
                ...grantee,
                permissions: [],
                inheritedPermissions: [],
            };
            onDelete(changedGrantee);
            permissionsRemoveInteraction(
                grantee,
                mode === "ShareGrantee",
                granteePossibilities.assign.effective,
            );
            toggleDropdown();
        }
    }, [grantee, onDelete, toggleDropdown, mode, granteePossibilities, permissionsRemoveInteraction]);

    const handleOnChange = useCallback(
        (changedGrantee: IGranularGrantee) => {
            permissionsChangeInteraction(
                grantee,
                mode === "ShareGrantee",
                granteePossibilities.assign.effective,
                changedGrantee.permissions[0],
            );
            onChange(changedGrantee);
        },
        [grantee, onChange, mode, granteePossibilities, permissionsChangeInteraction],
    );

    if (!isShowDropdown) {
        return null;
    }

    return (
        <Overlay
            key="GranularPermissionsSelect"
            alignTo={`.${alignTo}`}
            alignPoints={overlayAlignPoints}
            className="s-granular-permissions-overlay"
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            closeOnParentScroll={true}
            onClose={toggleDropdown}
        >
            <ItemsWrapper smallItemsSpacing={true}>
                {granteePossibilities.assign.items.map((permissionItem) => {
                    return (
                        !permissionItem.hidden && (
                            <GranularPermissionSelectItemWithBubble
                                grantee={grantee}
                                key={permissionItem.id}
                                permission={permissionItem}
                                selectedPermission={selectedPermission}
                                toggleDropdown={toggleDropdown}
                                onChange={handleOnChange}
                                handleSetSelectedPermission={handleSetSelectedPermission}
                                bubbleTextId={permissionItem.tooltip}
                                showBubble={!permissionItem.enabled}
                            />
                        )
                    );
                })}
                <Separator />
                <RemoveItem
                    disabled={!granteePossibilities.remove.enabled}
                    onClick={handleOnDelete}
                    tooltipId={granteePossibilities.remove.tooltip}
                />
            </ItemsWrapper>
        </Overlay>
    );
};
