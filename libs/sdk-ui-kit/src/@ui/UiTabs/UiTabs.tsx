// (C) 2025 GoodData Corporation

import React, { useMemo, useRef } from "react";

import { IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { SizeLarge, SizeMedium, SizeSmall } from "../@types/size.js";
import { bem } from "../@utils/bem.js";
import { makeTabsKeyboardNavigation } from "../@utils/keyboardNavigation.js";

/**
 * @internal
 */
export interface UiTabsAccessibilityConfig extends IAccessibilityConfigBase {
    tabRole?: React.HTMLAttributes<HTMLElement>["role"];
}

/**
 * @internal
 */
export interface UiTabsProps {
    size?: SizeSmall | SizeMedium | SizeLarge;
    tabs: Array<UiTab>;
    onTabSelect: (tab: UiTab) => void;
    selectedTabId: string;
    accessibilityConfig?: UiTabsAccessibilityConfig;
}

/**
 * @internal
 */
export interface UiTab {
    id: string;
    label: string;
}

const { b, e } = bem("gd-ui-kit-tabs");

/**
 * @internal
 */
export const UiTabs: React.FC<UiTabsProps> = ({
    size = "medium",
    tabs,
    onTabSelect,
    selectedTabId,
    accessibilityConfig,
}) => {
    const tabRefs = useRef<HTMLButtonElement[]>([]);
    const focusedIndexRef = useRef<number | null>(null);

    const focusTab = (index: number) => {
        tabRefs.current[index]?.focus();
    };

    const handleKeyDown = useMemo(
        () =>
            makeTabsKeyboardNavigation({
                onFocusPrevious: () => {
                    const previousTabIndex = (focusedIndexRef.current - 1 + tabs.length) % tabs.length;
                    focusTab(previousTabIndex);
                },
                onFocusNext: () => {
                    const nextTabIndex = (focusedIndexRef.current + 1) % tabs.length;
                    focusTab(nextTabIndex);
                },
                onFocusFirst: () => {
                    focusTab(0);
                },
                onFocusLast: () => {
                    focusTab(tabs.length - 1);
                },
                onSelect: () => {
                    const focusedTab = tabs[focusedIndexRef.current];
                    onTabSelect(focusedTab);
                },
            }),
        [tabs, onTabSelect],
    );

    return (
        <div
            className={b({ size })}
            aria-label={accessibilityConfig?.ariaLabel}
            aria-labelledby={accessibilityConfig?.ariaLabelledBy}
            aria-describedby={accessibilityConfig?.ariaDescribedBy}
            aria-expanded={accessibilityConfig?.ariaExpanded}
            role={accessibilityConfig?.role}
        >
            {tabs.map((tab, index) => (
                <button
                    key={tab.id}
                    className={e("item", { selected: tab.id === selectedTabId })}
                    onClick={() => onTabSelect(tab)}
                    role={accessibilityConfig?.tabRole}
                    aria-selected={tab.id === selectedTabId}
                    tabIndex={tab.id === selectedTabId ? 0 : -1}
                    ref={(el) => (tabRefs.current[index] = el)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => (focusedIndexRef.current = index)}
                >
                    <span className={e("label")}>{tab.label}</span>
                </button>
            ))}
        </div>
    );
};
