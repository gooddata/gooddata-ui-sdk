// (C) 2025 GoodData Corporation

import { useState } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { ComponentTable, UiTab, UiTabs, UiTabsProps, propCombinationsFor } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

const tabs = [
    { id: "tab1", label: "Tab 1" },
    { id: "tab2", label: "Tab 2" },
    { id: "tab3", label: "Tab 3" },
    { id: "tab4", label: "Tab 4" },
] as UiTab[];

const propCombination = propCombinationsFor({
    tabs,
    selectedTabId: "tab1",
    onTabSelect: () => {},
    accessibilityConfig: {
        ariaLabel: "Tabs",
        ariaRole: "tablist",
        tabRole: "tab",
    },
} as UiTabsProps);

const allSizes = propCombination("size", ["large", "medium", "small"]);

function UiTabsTest({ showCode }: { showCode?: boolean }) {
    return (
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
}

function InteractiveUiTabsTest() {
    const [selectedTabId, setSelectedTabId] = useState<string>("tab1");
    return (
        <UiTabs
            tabs={tabs}
            onTabSelect={(tab) => setSelectedTabId(tab.id)}
            selectedTabId={selectedTabId}
            size="large"
        />
    );
}

const manyTabs = Array.from({ length: 20 }, (_, i) => ({
    id: `tab${i + 1}`,
    label: `Tab ${i + 1}`,
})) as UiTab[];

const manyTabsWithLongLabels = Array.from({ length: 15 }, (_, i) => ({
    id: `tab${i + 1}`,
    label: `This is a very long tab label for Tab ${i + 1}`,
})) as UiTab[];

function UiTabsWithOverflowTest() {
    const [selectedTabId, setSelectedTabId] = useState<string>("tab1");
    return (
        <IntlWrapper locale="en-US">
            <div>
                <h3>Many Tabs with Overflow Dropdown (constrained width)</h3>
                <div style={{ width: "600px", border: "1px dashed #ccc", padding: "10px" }}>
                    <UiTabs
                        tabs={manyTabs}
                        onTabSelect={(tab) => setSelectedTabId(tab.id)}
                        selectedTabId={selectedTabId}
                        size="large"
                        enableOverflowDropdown
                    />
                </div>

                <h3 style={{ marginTop: "40px" }}>Many Tabs with Label Truncation (max 20 chars)</h3>
                <div style={{ width: "800px", border: "1px dashed #ccc", padding: "10px" }}>
                    <UiTabs
                        tabs={manyTabsWithLongLabels}
                        onTabSelect={(tab) => setSelectedTabId(tab.id)}
                        selectedTabId={selectedTabId}
                        size="large"
                        enableOverflowDropdown
                        maxLabelLength={20}
                    />
                </div>

                <h3 style={{ marginTop: "40px" }}>Medium Size with Many Tabs</h3>
                <div style={{ width: "500px", border: "1px dashed #ccc", padding: "10px" }}>
                    <UiTabs
                        tabs={manyTabs}
                        onTabSelect={(tab) => setSelectedTabId(tab.id)}
                        selectedTabId={selectedTabId}
                        size="medium"
                        enableOverflowDropdown
                    />
                </div>

                <h3 style={{ marginTop: "40px" }}>Small Size with Many Tabs</h3>
                <div style={{ width: "400px", border: "1px dashed #ccc", padding: "10px" }}>
                    <UiTabs
                        tabs={manyTabs}
                        onTabSelect={(tab) => setSelectedTabId(tab.id)}
                        selectedTabId={selectedTabId}
                        size="small"
                        enableOverflowDropdown
                    />
                </div>
            </div>
        </IntlWrapper>
    );
}

export default {
    title: "15 Ui/UiTabs",
};

export function Default() {
    return <UiTabsTest />;
}
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiTabsTest />);
Themed.parameters = { kind: "themed", screenshot: true };

export function Interface() {
    return <UiTabsTest showCode />;
}
Interface.parameters = { kind: "interface" };

export function Interactive() {
    return <InteractiveUiTabsTest />;
}
Interactive.parameters = { kind: "interactive" };

export function WithOverflowAndScrolling() {
    return <UiTabsWithOverflowTest />;
}
WithOverflowAndScrolling.parameters = { kind: "interactive" };
