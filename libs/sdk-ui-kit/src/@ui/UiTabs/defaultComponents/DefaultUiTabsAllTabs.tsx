// (C) 2025 GoodData Corporation

import { RefObject, useCallback, useState } from "react";

import { EmptyObject } from "@gooddata/util";

import { Dropdown } from "../../../Dropdown/index.js";
import {
    ListWithActionsFocusStore,
    useFocusWithinContainer,
    useListWithActionsFocusStoreValue,
} from "../../hooks/useListWithActionsFocus.js";
import {
    SELECT_ITEM_ACTION,
    useListWithActionsKeyboardNavigation,
} from "../../hooks/useListWithActionsKeyboardNavigation.js";
import { UiTabsBem } from "../bem.js";
import { getTypedUiTabsContextStore } from "../context.js";
import { IUiTab, IUiTabComponentProps } from "../types.js";

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

    const [isOpen, setIsOpen] = useState(false);

    useActionListener(({ action }) => {
        if (action.closeOnSelect === "all") {
            setIsOpen(false);
        }
    });

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

    const listWithActionsFocusStoreValue = useListWithActionsFocusStoreValue<
        IUiTab<TTabProps, TTabActionProps>
    >((item) => item.id);

    const { containerRef } = useFocusWithinContainer(
        listWithActionsFocusStoreValue.makeId({ item: focusedItem, action: focusedAction }) ?? "",
    );

    if (!isOverflowing) {
        return null;
    }

    return (
        <div className={UiTabsBem.e("dropdown-wrapper")}>
            <div className={UiTabsBem.e("dropdown")}>
                <Dropdown
                    renderButton={({ toggleDropdown, isOpen, buttonRef, ariaAttributes }) => (
                        <AllTabsButton
                            onClick={toggleDropdown}
                            isOpen={isOpen}
                            ref={buttonRef}
                            ariaAttributes={ariaAttributes}
                        />
                    )}
                    renderBody={({ ariaAttributes }) => (
                        <ListWithActionsFocusStore value={listWithActionsFocusStoreValue}>
                            <div
                                className={UiTabsBem.e("tab-list")}
                                role="grid"
                                ref={containerRef as RefObject<HTMLDivElement>}
                                onKeyDown={onKeyboardNavigation}
                                tabIndex={-1}
                                id={listWithActionsFocusStoreValue.containerId}
                                {...ariaAttributes}
                                aria-label={"TODO"}
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
                        </ListWithActionsFocusStore>
                    )}
                    autofocusOnOpen
                    shouldTrapFocus
                    alignPoints={[{ align: "br tr" }, { align: "tr br" }]}
                    closeOnEscape
                    accessibilityConfig={{
                        triggerRole: "button",
                        popupRole: "listbox",
                    }}
                    onToggle={(desiredState) => {
                        setIsOpen((wasOpen) => desiredState ?? !wasOpen);
                    }}
                    isOpen={isOpen}
                    onOpenStateChanged={() => {
                        setFocusedIndex(tabs.findIndex((t) => t.id === selectedTabId) ?? 0);
                        setFocusedAction(SELECT_ITEM_ACTION);
                    }}
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
    const makeId = ListWithActionsFocusStore.useContextStoreOptional((ctx) => ctx.makeId);

    return (
        <div
            className={UiTabsBem.e("tab-list-item", {
                focused: isFocused,
                "select-item": focusedAction === SELECT_ITEM_ACTION,
            })}
            role="row"
            aria-rowindex={index + 1}
            aria-labelledby={makeId?.({ item, action: SELECT_ITEM_ACTION })}
            tabIndex={-1}
        >
            <div className={UiTabsBem.e("tab-list-item-value")} onClick={onApply} role={"gridcell"}>
                <div
                    role={"button"}
                    tabIndex={isSelected ? 0 : -1}
                    id={makeId?.({ item, action: SELECT_ITEM_ACTION })}
                >
                    <TabValue tab={item} isSelected={isSelected} location={"allList"} />
                </div>
            </div>
            {(item.actions ?? []).length ? (
                <div
                    className={UiTabsBem.e("tab-list-item-actions", { focused: isFocused })}
                    role={"gridcell"}
                >
                    <TabActions
                        tab={item}
                        location={"allList"}
                        tabIndex={-1}
                        id={makeId?.({ item, action: "selectTabActions" })}
                    />
                </div>
            ) : null}
        </div>
    );
}
