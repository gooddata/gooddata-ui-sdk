// (C) 2025 GoodData Corporation

import { SizeLarge, SizeMedium, SizeSmall } from "../@types/size.js";
import React, { useRef } from "react";
import { bem } from "../@utils/bem.js";

/**
 * @internal
 */
export interface UiTabsProps {
    size?: SizeSmall | SizeMedium | SizeLarge;
    tabs: Array<UiTab>;
    onTabSelect: (tab: UiTab) => void;
    selectedTabId: string;
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
export const UiTabs: React.FC<UiTabsProps> = ({ size = "medium", tabs, onTabSelect, selectedTabId }) => {
    const tabRefs = useRef<HTMLButtonElement[]>([]);

    const handleKeyDown = (e, currentIndex) => {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            const nextTabIndex = (currentIndex + 1) % tabs.length;
            tabRefs.current[nextTabIndex]?.focus();
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            const previousTabIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            tabRefs.current[previousTabIndex]?.focus();
        }
    };

    return (
        <div className={b({ size })} role="tablist" aria-label="Tabs">
            {tabs.map((tab, index) => (
                <button
                    key={tab.id}
                    className={e("item", { selected: tab.id === selectedTabId })}
                    onClick={() => onTabSelect(tab)}
                    role="tab"
                    aria-selected={tab.id === selectedTabId}
                    tabIndex={tab.id === selectedTabId ? 0 : -1}
                    ref={(el) => (tabRefs.current[index] = el)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                >
                    <span className={e("label")}>{tab.label}</span>
                </button>
            ))}
        </div>
    );
};
