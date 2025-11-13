// (C) 2025 GoodData Corporation

import { useCallback, useState } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import {
    ComponentTable,
    IUiTab,
    IUiTabsProps,
    UiTabs,
    propCombinationsFor,
    separatorStaticItem,
} from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

const tabs = [
    { id: "tab1", label: "Tab 1" },
    { id: "tab2", label: "Tab 2" },
    { id: "tab3", label: "Tab 3" },
    { id: "tab4", label: "Tab 4" },
] satisfies IUiTab[];

const propCombination = propCombinationsFor<IUiTabsProps>({
    tabs,
    selectedTabId: "tab1",
    onTabSelect: () => {},
    accessibilityConfig: {
        ariaLabel: "Tabs",
        role: "tablist",
        tabRole: "tab",
    },
});

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
})) satisfies IUiTab[];

const manyTabsWithLongLabels = Array.from({ length: 20 }, (_, i) => ({
    id: `tab${i + 1}`,
    label: `This is a very long tab label for Tab ${i + 1}`,
}));

function UiTabsWithOverflowTest() {
    const [selectedTabId, setSelectedTabId] = useState<string>("tab1");

    const setApproved = useCallback((tabId: string, isApproved: boolean) => {
        setTabs((tabs) => {
            return tabs.map((tab) => {
                if (tab.id === tabId) {
                    return {
                        ...tab,
                        isApproved,
                    };
                }
                return tab;
            });
        });
    }, []);

    const [customTabs, setTabs] = useState<IUiTab<{ isApproved?: boolean }>[]>(
        Array.from({ length: 20 }, (_, i) => ({
            id: `tab${i + 1}`,
            label: `Tab ${i + 1}`,
            actions: [
                {
                    id: `approve`,
                    label: `Approve`,
                    onSelect: () => setApproved(`tab${i + 1}`, true),
                },
                {
                    id: `disapprove`,
                    label: `Disapprove`,
                    onSelect: () => setApproved(`tab${i + 1}`, false),
                },
                separatorStaticItem,
                {
                    id: "closeAll",
                    label: "Close all",
                    onSelect: () => undefined,
                    closeOnSelect: "all",
                },
            ],
        })),
    );

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
                    />
                </div>

                <h3 style={{ marginTop: "40px" }}>Many Tabs with Label Truncation (max 20 chars)</h3>
                <div style={{ width: "800px", border: "1px dashed #ccc", padding: "10px" }}>
                    <UiTabs
                        tabs={manyTabsWithLongLabels}
                        onTabSelect={(tab) => setSelectedTabId(tab.id)}
                        selectedTabId={selectedTabId}
                        size="large"
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
                    />
                </div>

                <h3 style={{ marginTop: "40px" }}>
                    With actions and custom value and all tabs button renderer
                </h3>
                <div style={{ width: "500px", border: "1px dashed #ccc", padding: "10px" }}>
                    <UiTabs
                        tabs={customTabs}
                        onTabSelect={(tab) => setSelectedTabId(tab.id)}
                        selectedTabId={selectedTabId}
                        size="large"
                        AllTabsButton={({ isOpen, onClick }) => (
                            <button onClick={onClick}>{isOpen ? "open" : "closed"}</button>
                        )}
                        TabValue={({ tab, isSelected, location }) =>
                            location === "tabs" ? (
                                <>
                                    <span style={isSelected ? { fontWeight: "bold" } : undefined}>
                                        {tab.label}
                                    </span>{" "}
                                    {tab.isApproved === undefined ? "" : tab.isApproved ? "✅" : "❌"}
                                </>
                            ) : (
                                <span
                                    style={{
                                        fontWeight: isSelected ? "bold" : "inherit",
                                        color:
                                            tab.isApproved === undefined
                                                ? "inherit"
                                                : tab.isApproved
                                                  ? "green"
                                                  : "red",
                                    }}
                                >
                                    {tab.label}
                                </span>
                            )
                        }
                    />
                </div>

                <h3 style={{ marginTop: "40px" }}>Small Size with Many Tabs</h3>
                <div style={{ width: "400px", border: "1px dashed #ccc", padding: "10px" }}>
                    <UiTabs
                        tabs={manyTabs}
                        onTabSelect={(tab) => setSelectedTabId(tab.id)}
                        selectedTabId={selectedTabId}
                        size="small"
                    />
                </div>
            </div>
        </IntlWrapper>
    );
}

export default {
    title: "15 Ui/UiTabs",
};

const screenshotConfig = { misMatchThreshold: 0.01 };

export function Default() {
    return <UiTabsTest />;
}
Default.parameters = { kind: "default", screenshot: screenshotConfig };

export const Themed = () => wrapWithTheme(<UiTabsTest />);
Themed.parameters = { kind: "themed", screenshot: screenshotConfig };

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
