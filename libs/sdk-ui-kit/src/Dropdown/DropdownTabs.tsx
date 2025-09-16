// (C) 2007-2025 GoodData Corporation

import cx from "classnames";

import { ITab, Tabs } from "../Tabs/index.js";

/**
 * @internal
 */
export interface IDropdownTagsProps {
    tabs?: ITab[];
    className?: string;
    selectedTabId?: string;
    onTabSelect?: (tab: ITab) => void;
}

/**
 * @internal
 */
export function DropdownTabs({ tabs, selectedTabId, onTabSelect, className }: IDropdownTagsProps) {
    return (
        <Tabs
            tabs={tabs}
            className={cx("gd-dropdown-tabs", className)}
            selectedTabId={selectedTabId}
            onTabSelect={onTabSelect}
        />
    );
}
