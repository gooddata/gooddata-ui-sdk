// (C) 2025 GoodData Corporation

import { useCallback, useEffect } from "react";

import { useCombineRefs } from "@gooddata/sdk-ui";
import { EmptyObject } from "@gooddata/util";

import { useFocusWithinContainer } from "../../hooks/useFocusWithinContainer.js";
import { ScopedIdStore, useScopedIdStoreValue } from "../../hooks/useScopedId.js";
import { UiTabsBem } from "../bem.js";
import { getTypedUiTabsContextStore } from "../context.js";
import { IUiTab, IUiTabComponentProps } from "../types.js";
import { useTabsKeyboardNavigation } from "../useTabsKeyboardNavigation.js";

/**
 * @internal
 */
export function DefaultUiTabsContainer<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>(_props: IUiTabComponentProps<"Container", TTabProps, TTabActionProps>) {
    const store = getTypedUiTabsContextStore<TTabProps, TTabActionProps>();
    const {
        Tab,
        accessibilityConfig,
        size,
        tabs,
        selectedTabId,
        onTabSelect,
        containerRef: resizeContainerRef,
        AllTabs,
        disableBottomBorder,
        isOverflowing,
    } = store.useContextStoreValues([
        "Tab",
        "accessibilityConfig",
        "size",
        "tabs",
        "selectedTabId",
        "onTabSelect",
        "containerRef",
        "AllTabs",
        "disableBottomBorder",
        "isOverflowing",
    ]);

    const handleSelectTab = useCallback(
        (tab: IUiTab<TTabProps, TTabActionProps>) => {
            onTabSelect(tab);
        },
        [onTabSelect],
    );

    const { onKeyDown, focusedItem } = useTabsKeyboardNavigation({
        items: tabs,
        onSelect: handleSelectTab,
        focusedIndex: tabs.findIndex((t) => t.id === selectedTabId) ?? 0,
    });

    const scopedIdStoreValue = useScopedIdStoreValue<IUiTab<TTabProps, TTabActionProps> | undefined>(
        (item) => item?.id,
    );

    const { containerRef: focusContainerRef } = useFocusWithinContainer(
        scopedIdStoreValue.makeId({ item: focusedItem, specifier: "tab" }) ?? "",
    );

    const focusedItemContainerId = scopedIdStoreValue.makeId({
        item: focusedItem,
        specifier: "tab-scroll-target",
    });

    useEffect(() => {
        document
            .getElementById(focusedItemContainerId)
            ?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }, [focusedItemContainerId, selectedTabId, isOverflowing]);

    return (
        <div className={UiTabsBem.b({ size, overflow: true, "disable-border": disableBottomBorder })}>
            <div
                className={UiTabsBem.e("container")}
                ref={useCombineRefs(resizeContainerRef, focusContainerRef)}
                onKeyDown={onKeyDown}
                id={scopedIdStoreValue.containerId}
                tabIndex={-1}
                aria-label={accessibilityConfig?.ariaLabel}
                aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                aria-describedby={accessibilityConfig?.ariaDescribedBy}
                aria-expanded={accessibilityConfig?.ariaExpanded}
                role={accessibilityConfig?.role}
            >
                <ScopedIdStore value={scopedIdStoreValue}>
                    {tabs.map((tab) => {
                        const isSelected = selectedTabId === tab.id;
                        const onSelect = () => onTabSelect(tab);
                        const isFocused = focusedItem === tab;

                        return (
                            <Tab
                                key={tab.id}
                                tab={tab}
                                isSelected={isSelected}
                                isFocused={isFocused}
                                onSelect={onSelect}
                            />
                        );
                    })}
                </ScopedIdStore>
            </div>

            <AllTabs />
        </div>
    );
}
