// (C) 2025 GoodData Corporation

import { type RefObject, useCallback, useEffect, useState } from "react";

import { type EmptyObject } from "@gooddata/util";

import { useMediaQuery } from "../../../responsive/index.js";
import { useFocusWithinContainer } from "../../hooks/useFocusWithinContainer.js";
import {
    SELECT_ITEM_ACTION,
    useListWithActionsKeyboardNavigation,
} from "../../hooks/useListWithActionsKeyboardNavigation.js";
import { ScopedIdStore, useScopedIdStoreValue } from "../../hooks/useScopedId.js";
import { UiDropdown } from "../../UiDropdown/UiDropdown.js";
import { UiTabsBem } from "../bem.js";
import { getTypedUiTabsContextStore } from "../context.js";
import { type IUiTab, type IUiTabComponentProps } from "../types.js";

/**
 * @internal
 */
export function DefaultUiTabsAllTabs<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>(_props: IUiTabComponentProps<"AllTabs", TTabProps, TTabActionProps>) {
    const store = getTypedUiTabsContextStore<TTabProps, TTabActionProps>();
    const { tabs, onTabSelect, AllTabsButton, selectedTabId, isOverflowing, useActionListener } =
        store.useContextStoreValues([
            "tabs",
            "onTabSelect",
            "selectedTabId",
            "AllTabsButton",
            "isOverflowing",
            "useActionListener",
        ]);

    const isMobile = useMediaQuery("mobileDevice");
    const [isOpen, setIsOpen] = useState(false);

    const handleDropdownSelect = useCallback(
        (item: IUiTab<TTabProps, TTabActionProps>) => () => {
            onTabSelect(item);
            setIsOpen(false);
        },
        [onTabSelect],
    );

    const { onKeyboardNavigation, focusedItem, focusedAction, setFocusedIndex, setFocusedAction } =
        useListWithActionsKeyboardNavigation({
            items: tabs,
            getItemAdditionalActions: (item) => ((item.actions ?? []).length ? ["selectTabActions"] : []),
            actionHandlers: {
                selectItem: handleDropdownSelect,
                selectTabActions: () => undefined,
            },
            isSimple: true,
        });

    const scopedIdStoreValue = useScopedIdStoreValue<IUiTab<TTabProps, TTabActionProps> | undefined>(
        (item) => item?.id ?? "",
    );

    const { containerRef } = useFocusWithinContainer(
        scopedIdStoreValue.makeId({ item: focusedItem, specifier: focusedAction }) ?? "",
    );

    const selectedItemId = focusedItem
        ? scopedIdStoreValue.makeId({ item: focusedItem, specifier: "container" })
        : "";
    useEffect(() => {
        document
            .getElementById(selectedItemId)
            ?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    }, [selectedItemId, isOpen]);

    useActionListener(({ action, tab }) => {
        if (action.closeOnSelect === "all") {
            setIsOpen(false);
            return;
        }
        const tabContainerId = scopedIdStoreValue.makeId({ item: tab, specifier: "container" });

        window.setTimeout(() => {
            document
                .getElementById(tabContainerId)
                ?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
        }, 50);
    });

    const handleOpenChange = useCallback((newIsOpen: boolean) => {
        setIsOpen(newIsOpen);
    }, []);

    const handleOpen = useCallback(() => {
        const selectedTabIndex = tabs.findIndex((t) => t.id === selectedTabId);

        setFocusedIndex(selectedTabIndex >= 0 ? selectedTabIndex : 0);
        setFocusedAction(SELECT_ITEM_ACTION);
    }, [tabs, selectedTabId, setFocusedIndex, setFocusedAction]);

    if (!isOverflowing) {
        return null;
    }

    return (
        <div className={UiTabsBem.e("dropdown-wrapper", { mobile: isMobile })}>
            <div className={UiTabsBem.e("dropdown", { mobile: isMobile })}>
                <UiDropdown
                    renderButton={({ toggleDropdown, isOpen, ref, ariaAttributes }) => (
                        <AllTabsButton
                            onClick={toggleDropdown}
                            isOpen={isOpen}
                            ref={ref}
                            ariaAttributes={ariaAttributes}
                        />
                    )}
                    renderBody={({ ariaAttributes }) => {
                        return (
                            <ScopedIdStore value={scopedIdStoreValue}>
                                <div
                                    className={UiTabsBem.e("tab-list", { mobile: isMobile })}
                                    ref={containerRef as RefObject<HTMLDivElement>}
                                    onKeyDown={onKeyboardNavigation}
                                    tabIndex={-1}
                                    {...ariaAttributes}
                                    role="grid"
                                    aria-rowcount={tabs.length}
                                >
                                    {tabs.map((item, index) => (
                                        <TabListItem
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            focusedAction={item === focusedItem ? focusedAction : undefined}
                                            onApply={handleDropdownSelect(item)}
                                        />
                                    ))}
                                </div>
                            </ScopedIdStore>
                        );
                    }}
                    autofocusOnOpen
                    enableFocusTrap
                    alignPoints={[{ align: "br tr" }, { align: "tr br" }]}
                    closeOnEscape
                    accessibilityConfig={{
                        triggerRole: "button",
                        popupRole: "listbox",
                    }}
                    onOpenChange={handleOpenChange}
                    isOpen={isOpen}
                    onOpen={handleOpen}
                />
            </div>
        </div>
    );
}

function TabListItem<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>({
    item,
    index,
    focusedAction,
    onApply,
}: {
    item: IUiTab<TTabProps, TTabActionProps>;
    index: number;
    focusedAction?: typeof SELECT_ITEM_ACTION | "selectTabActions";
    onApply: () => void;
}) {
    const store = getTypedUiTabsContextStore<TTabProps, TTabActionProps>();
    const { TabValue, TabActions, selectedTabId } = store.useContextStoreValues([
        "TabValue",
        "TabActions",
        "selectedTabId",
    ]);

    const isSelected = item.id === selectedTabId;
    const isFocused = !!focusedAction;
    const makeId = ScopedIdStore.useContextStoreOptional((ctx) => ctx.makeId);

    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const handleToggleActionsOpen = useCallback(
        (desiredState?: boolean) => setIsActionsOpen((wasOpen) => desiredState ?? !wasOpen),
        [setIsActionsOpen],
    );

    return (
        <div
            className={UiTabsBem.e("tab-list-item", {
                focused: isFocused,
                "select-item": focusedAction === SELECT_ITEM_ACTION,
                "actions-open": isActionsOpen,
            })}
            role="row"
            aria-rowindex={index + 1}
            aria-labelledby={makeId?.({ item, specifier: SELECT_ITEM_ACTION })}
            tabIndex={-1}
            id={makeId?.({ item, specifier: "container" })}
        >
            <div className={UiTabsBem.e("tab-list-item-value")} onClick={onApply} role={"gridcell"}>
                <div
                    role={"button"}
                    tabIndex={isSelected ? 0 : -1}
                    id={makeId?.({ item, specifier: SELECT_ITEM_ACTION })}
                    className={UiTabsBem.e("tab-list-item-value-button")}
                    aria-label={item.label}
                >
                    <TabValue tab={item} isSelected={isSelected} location={"allList"} />
                </div>
            </div>
            {(item.actions ?? []).length ? (
                <div
                    className={UiTabsBem.e("tab-list-item-actions", {
                        focused: isFocused,
                    })}
                    role={"gridcell"}
                    id={makeId?.({ item, specifier: "actions" })}
                >
                    <TabActions
                        tab={item}
                        location={"allList"}
                        tabIndex={-1}
                        id={makeId?.({ item, specifier: "selectTabActions" })}
                        isOpen={isActionsOpen}
                        onToggleOpen={handleToggleActionsOpen}
                    />
                </div>
            ) : null}
        </div>
    );
}
