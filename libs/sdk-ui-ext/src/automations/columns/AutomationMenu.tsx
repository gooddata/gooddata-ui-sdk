// (C) 2025 GoodData Corporation

import { useCallback, useMemo, useRef } from "react";

import { useIntl } from "react-intl";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import {
    ItemsWrapper,
    SingleSelectListItem,
    UiFocusManager,
    UiTooltip,
    makeMenuKeyboardNavigation,
    useToastMessage,
} from "@gooddata/sdk-ui-kit";

import { bem } from "../../notificationsPanel/bem.js";
import { messages } from "../messages.js";
import { AutomationAction, AutomationsType, IAutomationsPendingAction, IEditAutomation } from "../types.js";

const { b } = bem("gd-ui-ext-automation-menu-item");

interface IAutomationMenuItem {
    id: string;
    label: string;
    onClick: () => void;
    withSeparator?: boolean;
    disabled?: boolean;
    tooltip?: string;
}

export function AutomationMenu({
    item,
    workspace,
    canManage,
    isSubscribed,
    automationsType,
    canPause,
    canResume,
    editAutomation,
    deleteAutomation,
    unsubscribeFromAutomation,
    pauseAutomation,
    resumeAutomation,
    closeDropdown,
    setPendingAction,
}: {
    item: IAutomationMetadataObject;
    workspace: string;
    canManage: boolean;
    isSubscribed: boolean;
    automationsType: AutomationsType;
    canPause: boolean;
    canResume: boolean;
    editAutomation: IEditAutomation;
    deleteAutomation: AutomationAction;
    unsubscribeFromAutomation: AutomationAction;
    pauseAutomation: AutomationAction;
    resumeAutomation: AutomationAction;
    closeDropdown: () => void;
    setPendingAction: (pendingAction: IAutomationsPendingAction | undefined) => void;
}) {
    const intl = useIntl();
    const { addSuccess } = useToastMessage();
    const menuWrapperRef = useRef<HTMLDivElement>(null);
    const menuItemRefs = useRef<Map<string, HTMLElement>>(new Map());
    const editActionUnavailable = useMemo(() => {
        return !item.dashboard?.id;
    }, [item.dashboard?.id]);

    const setMenuItemRef = useCallback(
        (itemId: string) => (element: HTMLDivElement | HTMLButtonElement | null) => {
            if (element) {
                menuItemRefs.current.set(itemId, element);
            } else {
                menuItemRefs.current.delete(itemId);
            }
        },
        [],
    );

    const onEdit = useCallback(() => {
        if (editActionUnavailable) {
            return;
        }
        closeDropdown();
        editAutomation(item, workspace, item.dashboard?.id);
    }, [editAutomation, workspace, item, closeDropdown, editActionUnavailable]);

    const onDelete = useCallback(() => {
        closeDropdown();
        setPendingAction({
            type: "delete",
            automationsType,
            automationTitle: item.title,
            onConfirm: () => deleteAutomation(item),
        });
    }, [deleteAutomation, closeDropdown, setPendingAction, automationsType, item]);

    const onUnsubscribe = useCallback(() => {
        closeDropdown();
        setPendingAction({
            type: "unsubscribe",
            automationsType,
            automationTitle: item.title,
            onConfirm: () => unsubscribeFromAutomation(item),
        });
    }, [unsubscribeFromAutomation, closeDropdown, setPendingAction, automationsType, item]);

    const onPause = useCallback(() => {
        closeDropdown();
        setPendingAction({
            type: "pause",
            automationsType,
            automationTitle: item.title,
            onConfirm: () => pauseAutomation(item),
        });
    }, [pauseAutomation, closeDropdown, setPendingAction, automationsType, item]);

    const onResume = useCallback(() => {
        closeDropdown();
        setPendingAction({
            type: "resume",
            automationsType,
            automationTitle: item.title,
            onConfirm: () => resumeAutomation(item),
        });
    }, [resumeAutomation, closeDropdown, setPendingAction, automationsType, item]);

    const onCopyId = useCallback(() => {
        closeDropdown();
        navigator.clipboard.writeText(item.id);
        addSuccess(messages.messageCopyIdSuccess);
    }, [item.id, addSuccess, closeDropdown]);

    // Build menu items array
    const menuItems = useMemo<IAutomationMenuItem[]>(() => {
        const items: IAutomationMenuItem[] = [];

        if (canManage) {
            items.push({
                id: "edit",
                label: intl.formatMessage(messages.menuEdit),
                onClick: onEdit,
                disabled: editActionUnavailable,
                tooltip: editActionUnavailable ? intl.formatMessage(messages.menuEditUnavailable) : undefined,
            });
        }

        if (isSubscribed) {
            items.push({
                id: "unsubscribe",
                label: intl.formatMessage(messages.menuUnsubscribe),
                onClick: onUnsubscribe,
            });
        }

        if (canResume) {
            items.push({
                id: "resume",
                label: intl.formatMessage(messages.menuResume),
                onClick: onResume,
            });
        }

        if (canPause) {
            items.push({
                id: "pause",
                label: intl.formatMessage(messages.menuPause),
                onClick: onPause,
            });
        }

        items.push({
            id: "copyId",
            label: intl.formatMessage(messages.menuCopyId),
            onClick: onCopyId,
        });

        if (canManage) {
            items.push({
                id: "delete",
                label: intl.formatMessage(messages.menuDelete),
                onClick: onDelete,
                withSeparator: true,
            });
        }

        return items;
    }, [
        canManage,
        isSubscribed,
        canResume,
        canPause,
        editActionUnavailable,
        intl,
        onEdit,
        onUnsubscribe,
        onResume,
        onPause,
        onCopyId,
        onDelete,
    ]);

    // Keyboard navigation handler
    const menuKeyboardNavigationHandler = useMemo(
        () =>
            makeMenuKeyboardNavigation({
                onFocusFirst: () => {
                    const elements = Array.from(menuItemRefs.current.values());
                    if (elements.length > 0) {
                        elements[0]?.focus();
                    }
                },
                onFocusNext: () => {
                    const elements = Array.from(menuItemRefs.current.values());
                    const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
                    const nextElement =
                        currentIndex === elements.length - 1 ? elements[0] : elements[currentIndex + 1];
                    nextElement?.focus();
                },
                onFocusPrevious: () => {
                    const elements = Array.from(menuItemRefs.current.values());
                    const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
                    const previousElement =
                        currentIndex <= 0 ? elements[elements.length - 1] : elements[currentIndex - 1];
                    previousElement?.focus();
                },
                onClose: closeDropdown,
                onSelect: () => {
                    // Trigger click on the currently focused element
                    const focusedElement = document.activeElement as HTMLElement;
                    focusedElement?.click();
                },
            }),
        [closeDropdown],
    );

    return (
        <UiFocusManager enableAutofocus enableFocusTrap enableReturnFocusOnUnmount>
            <div onKeyDown={menuKeyboardNavigationHandler}>
                <ItemsWrapper smallItemsSpacing wrapperRef={menuWrapperRef}>
                    <div role="menu">
                        {menuItems.map((menuItem) => (
                            <AutomationMenuItem
                                key={menuItem.id}
                                menuItem={menuItem}
                                setMenuItemRef={setMenuItemRef}
                            />
                        ))}
                    </div>
                </ItemsWrapper>
            </div>
        </UiFocusManager>
    );
}

interface AutomationMenuItemProps {
    menuItem: IAutomationMenuItem;
    setMenuItemRef: (itemId: string) => (element: HTMLDivElement | HTMLButtonElement | null) => void;
}

function AutomationMenuItem({ menuItem, setMenuItemRef }: AutomationMenuItemProps) {
    return (
        <>
            {menuItem.withSeparator ? (
                <SingleSelectListItem
                    type="separator"
                    accessibilityConfig={{
                        role: "separator",
                    }}
                />
            ) : null}
            <UiTooltip
                content={menuItem.tooltip}
                triggerBy={["hover", "focus"]}
                arrowPlacement="right"
                disabled={!menuItem.tooltip}
                anchor={
                    <SingleSelectListItem
                        ref={setMenuItemRef(menuItem.id)}
                        className={b({
                            disabled: menuItem.disabled,
                        })}
                        title={menuItem.label}
                        onClick={menuItem.onClick}
                        elementType="button"
                        accessibilityConfig={{
                            role: "menuitem",
                            ariaDisabled: menuItem.disabled,
                            ariaHasPopup: "dialog",
                        }}
                    />
                }
            />
        </>
    );
}
