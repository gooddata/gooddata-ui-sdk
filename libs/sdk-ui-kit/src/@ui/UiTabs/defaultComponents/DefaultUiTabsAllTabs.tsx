// (C) 2025 GoodData Corporation

import { RefObject, useCallback, useEffect, useState } from "react";

import { EmptyObject } from "@gooddata/util";

import { Dropdown } from "../../../Dropdown/index.js";
import { useMediaQuery } from "../../../responsive/index.js";
import { useFocusWithinContainer } from "../../hooks/useFocusWithinContainer.js";
import {
    SELECT_ITEM_ACTION,
    useListWithActionsKeyboardNavigation,
} from "../../hooks/useListWithActionsKeyboardNavigation.js";
import { ScopedIdStore, useScopedIdStoreValue } from "../../hooks/useScopedId.js";
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

    if (!isOverflowing) {
        return null;
    }

    return (
        <div className={UiTabsBem.e("dropdown-wrapper", { mobile: isMobile })}>
            <div className={UiTabsBem.e("dropdown", { mobile: isMobile })}>
                <Dropdown
                    renderButton={({ toggleDropdown, isOpen, buttonRef, ariaAttributes }) => (
                        <AllTabsButton
                            onClick={toggleDropdown}
                            isOpen={isOpen}
                            ref={buttonRef as RefObject<HTMLElement>}
                            ariaAttributes={ariaAttributes}
                        />
                    )}
                    renderBody={({ ariaAttributes }) => (
                        <ScopedIdStore value={scopedIdStoreValue as any}>
                            <div
                                className={UiTabsBem.e("tab-list", { mobile: isMobile })}
                                ref={containerRef as RefObject<HTMLDivElement>}
                                onKeyDown={onKeyboardNavigation}
                                tabIndex={-1}
                                aria-label={"TODO"}
                                aria-rowcount={tabs.length}
                                {...ariaAttributes}
                                role="grid"
                                id={scopedIdStoreValue.containerId}
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
