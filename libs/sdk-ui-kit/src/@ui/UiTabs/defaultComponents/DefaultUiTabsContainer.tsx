// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { useCombineRefs } from "@gooddata/sdk-ui";
import { EmptyObject } from "@gooddata/util";

import {
    ListWithActionsFocusStore,
    useFocusWithinContainer,
    useListWithActionsFocusStoreValue,
} from "../../hooks/useListWithActionsFocus.js";
import { useListWithActionsKeyboardNavigation } from "../../hooks/useListWithActionsKeyboardNavigation.js";
import { UiTabsBem } from "../bem.js";
import { getTypedUiTabsContextStore } from "../context.js";
import { IUiTab, IUiTabComponentProps } from "../types.js";

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
    } = store.useContextStoreValues([
        "Tab",
        "accessibilityConfig",
        "size",
        "tabs",
        "selectedTabId",
        "onTabSelect",
        "containerRef",
        "AllTabs",
    ]);

    const handleSelectTab = useCallback(
        (tab: IUiTab<TTabProps, TTabActionProps>) => () => {
            onTabSelect(tab);
        },
        [onTabSelect],
    );

    const { onKeyboardNavigation, focusedItem, focusedAction } = useListWithActionsKeyboardNavigation({
        items: tabs,
        getItemAdditionalActions: (item) => ((item.actions ?? []).length ? ["selectTabActions"] : []),
        actionHandlers: {
            selectItem: handleSelectTab,
            selectTabActions: () => undefined,
        },
        isSimple: true,
        focusedIndex: tabs.findIndex((t) => t.id === selectedTabId) ?? 0,
    });

    const listWithActionsFocusStoreValue = useListWithActionsFocusStoreValue<
        IUiTab<TTabProps, TTabActionProps>
    >((item) => item.id);

    const { containerRef: focusContainerRef } = useFocusWithinContainer(
        listWithActionsFocusStoreValue.makeId({ item: focusedItem, action: focusedAction }) ?? "",
    );

    return (
        <div className={UiTabsBem.b({ size, overflow: true })}>
            <div
                className={UiTabsBem.e("container")}
                ref={useCombineRefs(resizeContainerRef, focusContainerRef)}
                onKeyDown={onKeyboardNavigation}
                id={listWithActionsFocusStoreValue.containerId}
                tabIndex={-1}
                aria-label={accessibilityConfig?.ariaLabel}
                aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                aria-describedby={accessibilityConfig?.ariaDescribedBy}
                aria-expanded={accessibilityConfig?.ariaExpanded}
                role={accessibilityConfig?.role}
            >
                <ListWithActionsFocusStore value={listWithActionsFocusStoreValue}>
                    {tabs.map((tab) => {
                        const isSelected = selectedTabId === tab.id;
                        const onSelect = () => onTabSelect(tab);

                        return (
                            <Tab
                                key={tab.id}
                                tab={tab}
                                isSelected={isSelected}
                                focusedAction={isSelected ? focusedAction : undefined}
                                onSelect={onSelect}
                            />
                        );
                    })}
                </ListWithActionsFocusStore>
            </div>

            <AllTabs />
        </div>
    );
}
