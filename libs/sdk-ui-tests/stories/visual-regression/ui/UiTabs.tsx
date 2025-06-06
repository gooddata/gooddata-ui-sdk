// (C) 2025 GoodData Corporation
import React, { useState } from "react";
import { UiTabs, UiTabsProps, UiTab, propCombinationsFor, ComponentTable } from "@gooddata/sdk-ui-kit";
import { storiesOf } from "../../_infra/storyRepository.js";
import { UiStories } from "../../_infra/storyGroups.js";
import { wrapWithTheme } from "../themeWrapper.js";
import noop from "lodash/noop.js";

const tabs = [
    { id: "tab1", label: "Tab 1" },
    { id: "tab2", label: "Tab 2" },
    { id: "tab3", label: "Tab 3" },
    { id: "tab4", label: "Tab 4" },
] as UiTab[];

const propCombination = propCombinationsFor({
    tabs,
    selectedTabId: "tab1",
    onTabSelect: noop,
    accessibilityConfig: {
        ariaLabel: "Tabs",
        ariaRole: "tablist",
        tabRole: "tab",
    },
} as UiTabsProps);

const allSizes = propCombination("size", ["large", "medium", "small"]);

const UiTabsTest: React.FC<{ showCode?: boolean }> = ({ showCode }) => (
    <div className="screenshot-target">
        <ComponentTable
            rowsBy={[allSizes]}
            Component={UiTabs}
            codeSnippet={showCode ? "UiTabs" : undefined}
            align="flex-start"
            cellWidth={400}
        />
    </div>
);

const InteractiveUiTabsTest: React.FC = () => {
    const [selectedTabId, setSelectedTabId] = useState<string>("tab1");
    return (
        <UiTabs
            tabs={tabs}
            onTabSelect={(tab) => setSelectedTabId(tab.id)}
            selectedTabId={selectedTabId}
            size="large"
        />
    );
};
storiesOf(`${UiStories}/UiTabs`)
    .add("default", () => <UiTabsTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<UiTabsTest />), { screenshot: true })
    .add("interface", () => <UiTabsTest showCode />)
    .add("interactive", () => <InteractiveUiTabsTest />);
