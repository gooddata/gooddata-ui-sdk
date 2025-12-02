// (C) 2025 GoodData Corporation

import { CSSProperties, ReactNode } from "react";

import { action } from "storybook/actions";

import {
    IUiTreeviewItemProps,
    UiIcon,
    UiLeveledTreeView,
    UiLeveledTreeview,
    UiStaticTreeView,
    UiStaticTreeview,
} from "@gooddata/sdk-ui-kit";

import { IStoryParameters } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

type StaticItem = { id: string; value: string };
type Level1Item = { level: 1; type: "visualisation"; id: string };
type Level2Item = { level: 2; type: "dashboard" | "insight" | "metric"; id: string };

// Mock items for the static treeview
const treeStatic: UiStaticTreeView<StaticItem>[] = [
    {
        item: {
            id: "parent-a",
            stringTitle: "Parent A",
            icon: "folder",
            isDisabled: false,
            data: { id: "da", value: "dA" },
            tooltip: "Parent A tooltip",
        },
        children: [
            {
                item: {
                    id: "parent-a-folder-a",
                    stringTitle: "Folder A",
                    icon: "folder",
                    isDisabled: false,
                    data: { id: "dada", value: "dAdA" },
                },
                children: [
                    {
                        item: {
                            id: "parent-a-folder-a-file-a",
                            stringTitle: "File A",
                            icon: "dashboard",
                            isDisabled: false,
                            data: { id: "dadafa", value: "dAdAfA" },
                        },
                    },
                ],
            },
            {
                item: {
                    id: "parent-a-folder-b",
                    stringTitle: "Folder B",
                    icon: "folder",
                    isDisabled: false,
                    data: { id: "dadb", value: "dAdB" },
                },
                children: [
                    {
                        item: {
                            id: "parent-a-folder-b-file-a",
                            stringTitle: "File A",
                            icon: "visualization",
                            isDisabled: false,
                            data: { id: "dadbfa", value: "dAdBfA" },
                        },
                    },
                ],
            },
            {
                item: {
                    id: "parent-a-file-a",
                    stringTitle: "File A",
                    icon: "file",
                    isDisabled: false,
                    data: { id: "dafa", value: "fAfA" },
                },
            },
            {
                item: {
                    id: "parent-a-file-b",
                    stringTitle: "File B",
                    icon: "file",
                    isDisabled: true,
                    data: { id: "dafb", value: "fAfB" },
                },
            },
        ],
    },
    {
        item: {
            id: "parent-b",
            stringTitle: "Parent B",
            icon: "folder",
            isDisabled: false,
            data: { id: "db", value: "dB" },
        },
        children: [
            {
                item: {
                    id: "parent-b-file-a",
                    stringTitle: "File A",
                    icon: "filter",
                    isDisabled: false,
                    data: { id: "dbfa", value: "dBfA" },
                },
            },
        ],
    },
    {
        item: {
            id: "file-a",
            stringTitle: "File A",
            icon: "file",
            isDisabled: true,
            data: { id: "fa", value: "fA" },
        },
    },
    {
        item: {
            id: "file-b",
            stringTitle: "File B",
            icon: "file",
            isDisabled: false,
            data: { id: "fb", value: "fB" },
        },
    },
];
// Mock items for the leveled treeview
const treeLeveled: UiLeveledTreeView<[Level1Item, Level2Item]>[] = [
    {
        item: {
            id: "parent-a",
            stringTitle: "Parent A",
            icon: "folder",
            isDisabled: false,
            data: { level: 1, type: "visualisation", id: "root-1" },
            tooltip: "Parent A tooltip",
        },
        children: [
            {
                item: {
                    id: "parent-a-folder-a",
                    stringTitle: "Folder A",
                    icon: "dashboard",
                    isDisabled: false,
                    data: { level: 2, type: "dashboard", id: "dashboard-1" },
                },
            },
            {
                item: {
                    id: "parent-a-folder-b",
                    stringTitle: "Folder B",
                    icon: "visualization",
                    isDisabled: false,
                    data: { level: 2, type: "insight", id: "insight-1" },
                },
            },
        ],
    },
    {
        item: {
            id: "parent-b",
            stringTitle: "Parent B",
            icon: "folder",
            isDisabled: false,
            data: { level: 1, type: "visualisation", id: "root-2" },
        },
        children: [
            {
                item: {
                    id: "parent-b-file-a",
                    stringTitle: "File A",
                    icon: "timer",
                    isDisabled: false,
                    data: { level: 2, type: "metric", id: "metric-1" },
                },
            },
            {
                item: {
                    id: "parent-b-file-b",
                    stringTitle: "File B",
                    icon: "timer",
                    isDisabled: false,
                    data: { level: 2, type: "metric", id: "metric-2" },
                },
            },
        ],
    },
    {
        item: {
            id: "parent-c",
            stringTitle: "Parent C",
            icon: "folder",
            isDisabled: false,
            data: { level: 1, type: "visualisation", id: "root-3" },
        },
        children: [
            {
                item: {
                    id: "parent-c-file-a",
                    stringTitle: "File A",
                    icon: "timer",
                    isDisabled: false,
                    data: { level: 2, type: "metric", id: "metric-3" },
                },
            },
            {
                item: {
                    id: "parent-c-file-b",
                    stringTitle: "File B",
                    icon: "timer",
                    isDisabled: false,
                    data: { level: 2, type: "metric", id: "metric-4" },
                },
            },
        ],
    },
];

function Example({ title, children }: { title: string; children: ReactNode }) {
    return (
        <>
            <h4>{title}</h4>
            <div style={{ width: 300 }}>{children}</div>
        </>
    );
}

// Default aria attributes for the treeview
const defaultAriaAttributes = {
    id: "test-treeview",
    "aria-label": "test treeview",
    "aria-labelledby": "test-treeview-label",
    role: "tree" as const,
};

function UiTreeviewExamples() {
    return (
        <div className="library-component screenshot-target">
            <Example title="Basic Treeview with static items, group and leaf selection">
                <UiStaticTreeview
                    items={treeStatic}
                    onSelect={action("onSelect")}
                    ariaAttributes={defaultAriaAttributes}
                    onClose={action("onClose")}
                    onUnhandledKeyDown={action("onUnhandledKeyDown")}
                />
            </Example>
            <Example title="Basic Treeview with static items, group selection">
                <UiStaticTreeview
                    selectionMode="groups-only"
                    items={treeStatic}
                    onSelect={action("onSelect")}
                    ariaAttributes={defaultAriaAttributes}
                    onClose={action("onClose")}
                    onUnhandledKeyDown={action("onUnhandledKeyDown")}
                />
            </Example>
            <Example title="Basic Treeview with static items, leaf selection">
                <UiStaticTreeview
                    selectionMode="leafs-only"
                    items={treeStatic}
                    onSelect={action("onSelect")}
                    ariaAttributes={defaultAriaAttributes}
                    onClose={action("onClose")}
                    onUnhandledKeyDown={action("onUnhandledKeyDown")}
                />
            </Example>
            <Example title="Basic Treeview with static items, group and leaf selection, default collapsed">
                <UiStaticTreeview
                    expandedMode="default-collapsed"
                    items={treeStatic}
                    onSelect={action("onSelect")}
                    ariaAttributes={defaultAriaAttributes}
                    onClose={action("onClose")}
                    onUnhandledKeyDown={action("onUnhandledKeyDown")}
                />
            </Example>

            <Example title="Basic Treeview with leveled items, group and leaf selection">
                <UiLeveledTreeview<[Level1Item, Level2Item]>
                    items={treeLeveled}
                    onSelect={action("onSelect")}
                    ariaAttributes={defaultAriaAttributes}
                    onClose={action("onClose")}
                    onUnhandledKeyDown={action("onUnhandledKeyDown")}
                    ItemComponent={TreeviewItemComponent}
                />
            </Example>
        </div>
    );
}

function TreeviewItemComponent({
    item,
    type,
    isExpanded,
    isFocused,
    isSelected,
    isCompact,
    onToggle,
    onSelect,
}: IUiTreeviewItemProps<Level1Item | Level2Item>): ReactNode {
    if (item.data.level === 1) {
        return (
            <div
                style={
                    {
                        "--ui-treeview-item-level": item.data.level,
                    } as CSSProperties
                }
                className={[
                    "gd-ui-kit-treeview__item",
                    isFocused ? "gd-ui-kit-treeview__item--isFocused" : "",
                    isSelected ? "gd-ui-kit-treeview__item--isSelected" : "",
                    isCompact ? "gd-ui-kit-treeview__item--isCompact" : "",
                    isExpanded ? "gd-ui-kit-treeview__item--isExpanded" : "",
                    item.isDisabled ? "gd-ui-kit-treeview__item--isDisabled" : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
                onClick={item.isDisabled ? undefined : onSelect}
            >
                {type === "group" ? (
                    <div
                        style={{ fontWeight: "bold", fontSize: "20px" }}
                        onClick={(e) => {
                            onToggle(e, !isExpanded);
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                    >
                        {isExpanded ? "-" : "+"}
                    </div>
                ) : null}
                {item.icon ? (
                    <div>
                        <UiIcon type={item.icon} size={16} color="complementary-7" />
                    </div>
                ) : null}
                <div>{item.stringTitle}</div>
            </div>
        );
    }
    return (
        <div
            style={
                {
                    "--ui-treeview-item-level": item.data.level,
                    border: "1px dotted gray",
                    margin: "5px",
                } as CSSProperties
            }
            className={[
                "gd-ui-kit-treeview__item",
                isFocused ? "gd-ui-kit-treeview__item--isFocused" : "",
                isSelected ? "gd-ui-kit-treeview__item--isSelected" : "",
                isCompact ? "gd-ui-kit-treeview__item--isCompact" : "",
                isExpanded ? "gd-ui-kit-treeview__item--isExpanded" : "",
                item.isDisabled ? "gd-ui-kit-treeview__item--isDisabled" : "",
            ]
                .filter(Boolean)
                .join(" ")}
            onClick={item.isDisabled ? undefined : onSelect}
        >
            {item.icon ? (
                <div>
                    <UiIcon type={item.icon} size={16} color="complementary-7" />
                </div>
            ) : null}
            <div>{item.stringTitle}</div>
        </div>
    );
}

export default {
    title: "15 Ui/UiTreeview",
};

export function Default() {
    return <UiTreeviewExamples />;
}
Default.parameters = { kind: "default", screenshot: true } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiTreeviewExamples />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;
