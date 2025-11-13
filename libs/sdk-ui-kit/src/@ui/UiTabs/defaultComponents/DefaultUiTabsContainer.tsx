// (C) 2025 GoodData Corporation

import { useCallback, useEffect } from "react";

import { useCombineRefs } from "@gooddata/sdk-ui";
import { EmptyObject } from "@gooddata/util";

import { useFocusWithinContainer } from "../../hooks/useFocusWithinContainer.js";
import { useListWithActionsKeyboardNavigation } from "../../hooks/useListWithActionsKeyboardNavigation.js";
import { ScopedIdStore, useScopedIdStoreValue } from "../../hooks/useScopedId.js";
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

    const scopedIdStoreValue = useScopedIdStoreValue<IUiTab<TTabProps, TTabActionProps> | undefined>(
        (item) => item?.id,
    );

    const { containerRef: focusContainerRef } = useFocusWithinContainer(
        scopedIdStoreValue.makeId({ item: focusedItem, specifier: focusedAction }) ?? "",
    );

    useEffect(() => {
        // We currently cannot use the smooth scrolling, since the actions dropdown uses the Bubble component
        // which does not reposition itself once opened. So with the smooth animation, it becomes detached.
        document
            .getElementById(scopedIdStoreValue.makeId({ item: focusedItem, specifier: "container" }))
            ?.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
    }, [focusedItem, scopedIdStoreValue, selectedTabId]);

    return (
        <div className={UiTabsBem.b({ size, overflow: true })}>
            <div
                className={UiTabsBem.e("container")}
                ref={useCombineRefs(resizeContainerRef, focusContainerRef)}
                onKeyDown={onKeyboardNavigation}
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
                </ScopedIdStore>
            </div>

            <AllTabs />
        </div>
    );
}
