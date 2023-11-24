// (C) 2007-2020 GoodData Corporation
import React from "react";
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
export const DropdownTabs: React.FC<IDropdownTagsProps> = ({
    tabs,
    selectedTabId,
    onTabSelect,
    className,
}) => {
    return (
        <Tabs
            tabs={tabs}
            className={`gd-dropdown-tabs ${className || ""}`}
            selectedTabId={selectedTabId}
            onTabSelect={onTabSelect}
        />
    );
};
