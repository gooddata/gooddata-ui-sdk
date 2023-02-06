// (C) 2022-2023 GoodData Corporation

import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { AccessGranularPermission } from "@gooddata/sdk-model";

import { GranularPermissionSelectItemWithBubble } from "./GranularPermissionItem";

import { GranteeItem, IGranteePermissionsPossibilities, IGranularGrantee } from "../types";
import { ItemsWrapper, Separator } from "../../../../List";
import { Overlay } from "../../../../Overlay";
import { IAlignPoint } from "../../../../typings/positioning";
import { withBubble } from "../../../../Bubble";
import { granularPermissionMessageLabels } from "../../../../locales";

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
}

const overlayAlignPoints: IAlignPoint[] = [{ align: "bl tl" }];

const RemoveItem: React.FC<{ disabled: boolean; tooltipId: string; onClick: () => void }> = ({
    disabled,
    tooltipId,
    onClick,
}) => {
    const className = cx("gd-list-item gd-menu-item", {
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
}) => {
    const handleOnDelete = useCallback(() => {
        if (granteePossibilities.remove.enabled) {
            const changedGrantee: GranteeItem = {
                ...grantee,
                permissions: [],
                inheritedPermissions: [],
            };
            onDelete(changedGrantee);
            toggleDropdown();
        }
    }, [grantee, onDelete, toggleDropdown, granteePossibilities]);

    if (!isShowDropdown) {
        return null;
    }

    return (
        <Overlay
            key="GranularPermissionsSelect"
            alignTo={`.${alignTo}`}
            alignPoints={overlayAlignPoints}
            className="gd-granular-permissions-overlay"
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
                                onChange={onChange}
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
