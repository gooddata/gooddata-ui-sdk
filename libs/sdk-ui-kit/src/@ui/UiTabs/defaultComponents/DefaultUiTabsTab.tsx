// (C) 2025-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { type EmptyObject, simplifyText } from "@gooddata/util";

import { ScopedIdStore } from "../../hooks/useScopedId.js";
import { UiTooltip } from "../../UiTooltip/UiTooltip.js";
import { UiTabsBem } from "../bem.js";
import { getTypedUiTabsContextStore } from "../context.js";
import { type IUiTabComponentProps } from "../types.js";

/**
 * @internal
 */
export function DefaultUiTabsTab<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>({ tab, isSelected, onSelect, isFocused }: IUiTabComponentProps<"Tab", TTabProps, TTabActionProps>) {
    const store = getTypedUiTabsContextStore<TTabProps, TTabActionProps>();
    const { accessibilityConfig, TabValue, TabActions, maxLabelLength } = store.useContextStoreValues([
        "accessibilityConfig",
        "TabValue",
        "TabActions",
        "maxLabelLength",
    ]);

    const makeId = ScopedIdStore.useContextStoreOptional((ctx) => ctx.makeId);

    const isOverflowing = maxLabelLength !== undefined && tab.label.length > maxLabelLength;
    const tabId = tab.tabId ?? makeId?.({ item: tab, specifier: "tab" });
    const panelId = tab.panelId;
    const autoSelectOnFocus = tab.autoSelectOnFocus ?? false;

    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const handleToggleActionsOpen = useCallback(
        (desiredState?: boolean) => setIsActionsOpen((wasOpen) => desiredState ?? !wasOpen),
        [setIsActionsOpen],
    );
    const handleFocus = () => {
        if (autoSelectOnFocus && !isSelected) {
            onSelect();
        }
    };

    // When this tab is focused, both tab button and actions are tabbable (tabIndex=0)
    // This allows natural Tab key navigation from tab button to actions button
    const tabIndex = isFocused ? 0 : -1;

    const tabButton = (
        <button
            className={UiTabsBem.e("item", { selected: isSelected })}
            onClick={onSelect}
            onFocus={handleFocus}
            role={accessibilityConfig?.tabRole}
            aria-selected={isSelected}
            aria-controls={panelId}
            aria-label={tab.label}
            tabIndex={tabIndex}
            id={tabId}
            data-testid={`s-tab-${simplifyText(tab.label)}`}
        >
            <TabValue tab={tab} isSelected={isSelected} location={"tabs"} />
        </button>
    );

    return (
        <div
            className={UiTabsBem.e("tab-wrapper", {
                selected: isSelected,
                variant: tab.variant ?? "default",
                focused: isFocused ?? false,
                "actions-open": isActionsOpen,
            })}
        >
            <div
                className={UiTabsBem.e("tab-scroll-target")}
                id={makeId?.({ item: tab, specifier: "tab-scroll-target" })}
            />
            {isOverflowing ? (
                <UiTooltip
                    key={tab.id}
                    anchor={tabButton}
                    content={tab.label}
                    triggerBy={["hover", "focus"]}
                    arrowPlacement="top"
                    optimalPlacement
                />
            ) : (
                tabButton
            )}

            <div className={UiTabsBem.e("tabs-actions")} id={makeId?.({ item: tab, specifier: "actions" })}>
                <TabActions
                    tab={tab}
                    location={"tabs"}
                    id={makeId?.({ item: tab, specifier: "selectTabActions" })}
                    tabIndex={tabIndex}
                    isOpen={isActionsOpen}
                    onToggleOpen={handleToggleActionsOpen}
                />
            </div>
        </div>
    );
}
