// (C) 2025 GoodData Corporation

import { useCallback, useState } from "react";

import { EmptyObject } from "@gooddata/util";

import { SELECT_ITEM_ACTION } from "../../hooks/useListWithActionsKeyboardNavigation.js";
import { ScopedIdStore } from "../../hooks/useScopedId.js";
import { UiTooltip } from "../../UiTooltip/UiTooltip.js";
import { UiTabsBem } from "../bem.js";
import { getTypedUiTabsContextStore } from "../context.js";
import { IUiTabComponentProps } from "../types.js";

/**
 * @internal
 */
export function DefaultUiTabsTab<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>({ tab, isSelected, onSelect, focusedAction }: IUiTabComponentProps<"Tab", TTabProps, TTabActionProps>) {
    const store = getTypedUiTabsContextStore<TTabProps, TTabActionProps>();
    const { accessibilityConfig, TabValue, TabActions, maxLabelLength } = store.useContextStoreValues([
        "accessibilityConfig",
        "TabValue",
        "TabActions",
        "maxLabelLength",
    ]);

    const makeId = ScopedIdStore.useContextStoreOptional((ctx) => ctx.makeId);

    const isOverflowing = tab.label.length > maxLabelLength;

    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const handleToggleActionsOpen = useCallback(
        (desiredState?: boolean) => setIsActionsOpen((wasOpen) => desiredState ?? !wasOpen),
        [setIsActionsOpen],
    );

    const tabButton = (
        <button
            className={UiTabsBem.e("item", { selected: isSelected })}
            onClick={onSelect}
            role={accessibilityConfig?.tabRole}
            aria-selected={isSelected}
            aria-label={isOverflowing ? tab.label : undefined}
            tabIndex={focusedAction === SELECT_ITEM_ACTION ? 0 : -1}
            id={makeId?.({ item: tab, specifier: SELECT_ITEM_ACTION })}
        >
            <TabValue tab={tab} isSelected={isSelected} location={"tabs"} />
        </button>
    );

    return (
        <div
            className={UiTabsBem.e("tab-wrapper", {
                selected: isSelected,
                variant: tab.variant ?? "default",
                focused: !!focusedAction,
                "actions-open": isActionsOpen,
            })}
            id={makeId?.({ item: tab, specifier: "container" })}
        >
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

            <div className={UiTabsBem.e("tabs-actions")}>
                <TabActions
                    tab={tab}
                    location={"tabs"}
                    id={makeId?.({ item: tab, specifier: "selectTabActions" })}
                    tabIndex={focusedAction === "selectTabActions" ? 0 : -1}
                    isOpen={isActionsOpen}
                    onToggleOpen={handleToggleActionsOpen}
                />
            </div>
        </div>
    );
}
