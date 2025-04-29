// (C) 2022-2025 GoodData Corporation

import React, { useCallback, useEffect, useRef } from "react";
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
import { makeMenuKeyboardNavigation } from "../../../../@ui/@utils/keyboardNavigation.js";
import { ADD_GRANTEE_ID, ADD_GRANTEE_SELECT_ID } from "../utils.js";

interface IGranularPermissionsDropdownBodyProps {
    alignTo: string;
    grantee: IGranularGrantee;
    granteePossibilities: IGranteePermissionsPossibilities;
    selectedPermission: AccessGranularPermission;
    toggleDropdown(): void;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
    handleSetSelectedPermission: (permission: AccessGranularPermission) => void;
    mode: DialogModeType;
    id?: string;
}

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

const REMOVE_GRANULAR_PERMISSION_ID = "granular-permission-remove-id";

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
        <div
            id={REMOVE_GRANULAR_PERMISSION_ID}
            role="option"
            tabIndex={disabled ? -1 : 0}
            className={className}
            onClick={onClick}
        >
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
    selectedPermission,
    toggleDropdown,
    onChange,
    onDelete,
    handleSetSelectedPermission,
    mode,
    id,
}) => {
    const { permissionsChangeInteraction, permissionsRemoveInteraction } = useShareDialogInteraction();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedItemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedItemRef.current) {
            setTimeout(() => {
                selectedItemRef.current?.focus();
            }, 100);
        }
    }, []);

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

            const elementId = mode === "ShareGrantee" ? ADD_GRANTEE_ID : ADD_GRANTEE_SELECT_ID;
            const element = document.getElementById(elementId);

            element?.focus();
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

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (!dropdownRef.current) return;

            const items = Array.from(dropdownRef.current.querySelectorAll('[tabIndex="0"]'));
            const currentIndex = items.findIndex((item) => item === document.activeElement);

            const keyboardHandler = makeMenuKeyboardNavigation({
                onFocusPrevious: () => {
                    if (currentIndex > 0) {
                        (items[currentIndex - 1] as HTMLElement).focus();
                    } else {
                        (items[items.length - 1] as HTMLElement).focus();
                    }
                },
                onFocusNext: () => {
                    if (currentIndex < items.length - 1) {
                        (items[currentIndex + 1] as HTMLElement).focus();
                    } else {
                        (items[0] as HTMLElement).focus();
                    }
                },
                onFocusFirst: () => {
                    (items[0] as HTMLElement).focus();
                },
                onFocusLast: () => {
                    (items[items.length - 1] as HTMLElement).focus();
                },
                onSelect: () => {
                    if (document.activeElement) {
                        const activeElement = document.activeElement;
                        if (activeElement.id === REMOVE_GRANULAR_PERMISSION_ID) {
                            handleOnDelete();
                        } else {
                            const permissionId = activeElement.id as AccessGranularPermission;
                            if (permissionId && permissionId !== selectedPermission) {
                                const changedGrantee: IGranularGrantee = {
                                    ...grantee,
                                    permissions: [permissionId],
                                };
                                toggleDropdown();
                                handleSetSelectedPermission(permissionId);
                                handleOnChange(changedGrantee);
                            } else {
                                toggleDropdown();
                            }
                        }
                    }
                },
                onClose: () => {
                    toggleDropdown();
                },
                onUnhandledKeyDown: (event) => {
                    event.preventDefault();
                },
            });

            keyboardHandler(event);
        },
        [
            toggleDropdown,
            handleOnDelete,
            handleOnChange,
            handleSetSelectedPermission,
            grantee,
            selectedPermission,
        ],
    );

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
            <div id={id} ref={dropdownRef} onKeyDown={handleKeyDown} role="listbox">
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
                                    ref={
                                        permissionItem.id === selectedPermission ? selectedItemRef : undefined
                                    }
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
            </div>
        </Overlay>
    );
};
