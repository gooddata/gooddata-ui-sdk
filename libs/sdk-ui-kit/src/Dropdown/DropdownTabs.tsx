// (C) 2007-2020 GoodData Corporation
import React from "react";
import { ITab, Tabs } from "../Tabs/index.js";

/**
 * @internal
 */
export interface IDropdownTagsProps {
    tabs?: ITab[];
    selectedTabId?: string;
    onTabSelect?: (tab: ITab) => void;
}

/**
 * @internal
 */
export const DropdownTabs: React.FC<IDropdownTagsProps> = ({ tabs, selectedTabId, onTabSelect }) => {
    return (
        <Tabs
            tabs={tabs}
            className="gd-dropdown-tabs"
            selectedTabId={selectedTabId}
            onTabSelect={onTabSelect}
        />
    );
};
