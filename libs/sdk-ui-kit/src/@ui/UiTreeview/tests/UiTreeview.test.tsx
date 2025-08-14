// (C) 2025 GoodData Corporation

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { UiStaticTreeview, UiLeveledTreeview } from "../UiTreeview.js";
import { describe, it, expect, vi } from "vitest";
import * as types from "../types.js";
import { b, e } from "../treeviewBem.js";

type StaticItem = { id: string; value: string };
type Level1Item = { level: 1; type: "visualisation"; id: string };
type Level2Item = { level: 2; type: "dashboard" | "insight" | "metric"; id: string };

// Mock items for the static treeview

// stringTitle: "Parent A"
// stringTitle: "Parent A Folder A"
// stringTitle: "Parent A Folder A File A1"
// stringTitle: "Parent A Folder B"
// stringTitle: "Parent A Folder B File A2"
// stringTitle: "Parent A File A3"
// stringTitle: "Parent A File B3" //disabled
// stringTitle: "Parent B"
// stringTitle: "Parent B File A4"
// stringTitle: "File A5" //disabled
// stringTitle: "File B5"

const treeStatic: types.UiStaticTreeView<StaticItem>[] = [
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
                    stringTitle: "Parent A Folder A",
                    icon: "folder",
                    isDisabled: false,
                    data: { id: "dada", value: "dAdA" },
                },
                children: [
                    {
                        item: {
                            id: "parent-a-folder-a-file-a",
                            stringTitle: "Parent A Folder A File A1",
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
                    stringTitle: "Parent A Folder B",
                    icon: "folder",
                    isDisabled: false,
                    data: { id: "dadb", value: "dAdB" },
                },
                children: [
                    {
                        item: {
                            id: "parent-a-folder-b-file-a",
                            stringTitle: "Parent A Folder B File A2",
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
                    stringTitle: "Parent A File A3",
                    icon: "file",
                    isDisabled: false,
                    data: { id: "dafa", value: "fAfA" },
                },
            },
            {
                item: {
                    id: "parent-a-file-b",
                    stringTitle: "Parent A File B3",
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
                    stringTitle: "Parent B File A4",
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
            stringTitle: "File A5",
            icon: "file",
            isDisabled: true,
            data: { id: "fa", value: "fA" },
        },
    },
    {
        item: {
            id: "file-b",
            stringTitle: "File B5",
            icon: "file",
            isDisabled: false,
            data: { id: "fb", value: "fB" },
        },
    },
];
const treeStatic1: types.UiStaticTreeView<StaticItem>[] = [
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
                    stringTitle: "Parent A Folder A",
                    icon: "folder",
                    isDisabled: false,
                    data: { id: "dada", value: "dAdA" },
                },
                children: [
                    {
                        item: {
                            id: "parent-a-folder-a-file-a",
                            stringTitle: "Parent A Folder A File A1",
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
                    stringTitle: "Parent A Folder B",
                    icon: "folder",
                    isDisabled: false,
                    data: { id: "dadb", value: "dAdB" },
                },
                children: [
                    {
                        item: {
                            id: "parent-a-folder-b-file-a",
                            stringTitle: "Parent A Folder B File A2",
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
                    stringTitle: "Parent A File A3",
                    icon: "file",
                    isDisabled: false,
                    data: { id: "dafa", value: "fAfA" },
                },
            },
            {
                item: {
                    id: "parent-a-file-b",
                    stringTitle: "Parent A File B3",
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
                    stringTitle: "Parent B File A4",
                    icon: "filter",
                    isDisabled: false,
                    data: { id: "dbfa", value: "dBfA" },
                },
            },
        ],
    },
];
// Mock items for the leveled treeview

// stringTitle: "Parent A"
// stringTitle: "Folder A"
// stringTitle: "Folder B"
// stringTitle: "Parent B"
// stringTitle: "File A1"
// stringTitle: "File B1"
// stringTitle: "Parent C"
// stringTitle: "File A2"
// stringTitle: "File B2"

const treeLeveled: types.UiLeveledTreeView<[Level1Item, Level2Item]>[] = [
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
                    stringTitle: "File A1",
                    icon: "timer",
                    isDisabled: false,
                    data: { level: 2, type: "metric", id: "metric-1" },
                },
            },
            {
                item: {
                    id: "parent-b-file-b",
                    stringTitle: "File B1",
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
                    stringTitle: "File A2",
                    icon: "timer",
                    isDisabled: false,
                    data: { level: 2, type: "metric", id: "metric-3" },
                },
            },
            {
                item: {
                    id: "parent-c-file-b",
                    stringTitle: "File B2",
                    icon: "timer",
                    isDisabled: false,
                    data: { level: 2, type: "metric", id: "metric-4" },
                },
            },
        ],
    },
];

describe("UiTreeview", () => {
    const defaultAriaAttributes: types.UiTreeViewAriaAttributes = {
        id: "test-treeview",
        "aria-label": "test-treeview-label",
        "aria-labelledby": "test-treeview-labelledby",
    };

    const renderStaticTreeView = (
        props: Omit<types.IUiStaticTreeViewProps<StaticItem>, "ariaAttributes" | "items"> = {},
    ) => {
        return render(
            <UiStaticTreeview
                items={treeStatic}
                onSelect={vi.fn()}
                onClose={vi.fn()}
                ariaAttributes={defaultAriaAttributes}
                {...props}
            />,
        );
    };

    const renderStaticTreeView1 = (
        props: Omit<types.IUiStaticTreeViewProps<StaticItem>, "ariaAttributes" | "items"> = {},
    ) => {
        return render(
            <UiStaticTreeview
                items={treeStatic1}
                onSelect={vi.fn()}
                onClose={vi.fn()}
                ariaAttributes={defaultAriaAttributes}
                {...props}
            />,
        );
    };

    const renderLeveledTreeView = (
        props: Omit<types.IUiLeveledTreeViewProps<[Level1Item, Level2Item]>, "ariaAttributes" | "items"> = {},
    ) => {
        return render(
            <UiLeveledTreeview
                items={treeLeveled}
                onSelect={vi.fn()}
                onClose={vi.fn()}
                ariaAttributes={defaultAriaAttributes}
                {...props}
            />,
        );
    };

    const renderEmptyTreeView = (
        props: Omit<types.IUiLeveledTreeViewProps<[Level1Item, Level2Item]>, "ariaAttributes" | "items"> = {},
    ) => {
        return render(
            <UiLeveledTreeview
                items={[]}
                onSelect={vi.fn()}
                onClose={vi.fn()}
                ariaAttributes={defaultAriaAttributes}
                {...props}
            />,
        );
    };

    describe("UiStaticTreeview", () => {
        it("should render empty tree view", () => {
            expect(() => {
                renderEmptyTreeView();
            }).not.toThrow();
        });

        it("should render all items in default expanded mode", () => {
            renderStaticTreeView();

            expect(screen.getByText("Parent A")).toBeInTheDocument();
            expect(screen.getByText("Parent A Folder A")).toBeInTheDocument();
            expect(screen.getByText("Parent A Folder A File A1")).toBeInTheDocument();
            expect(screen.getByText("Parent A Folder B")).toBeInTheDocument();
            expect(screen.getByText("Parent A Folder B File A2")).toBeInTheDocument();
            expect(screen.getByText("Parent A File A3")).toBeInTheDocument();
            expect(screen.getByText("Parent A File B3")).toBeInTheDocument();
            expect(screen.getByText("Parent B")).toBeInTheDocument();
            expect(screen.getByText("Parent B File A4")).toBeInTheDocument();
            expect(screen.getByText("File A5")).toBeInTheDocument();
            expect(screen.getByText("File B5")).toBeInTheDocument();
        });

        it("should render root items in default collapsed mode", () => {
            renderStaticTreeView({
                expandedMode: "default-collapsed",
            });

            expect(screen.getByText("Parent A")).toBeInTheDocument();
            expect(screen.queryByText("Parent A Folder A")).toBe(null);
            expect(screen.queryByText("Parent A Folder A File A1")).toBe(null);
            expect(screen.queryByText("Parent A Folder B")).toBe(null);
            expect(screen.queryByText("Parent A Folder B File A2")).toBe(null);
            expect(screen.queryByText("Parent A File A3")).toBe(null);
            expect(screen.queryByText("Parent A File B3")).toBe(null);
            expect(screen.getByText("Parent B")).toBeInTheDocument();
            expect(screen.queryByText("Parent B File A4")).toBe(null);
            expect(screen.getByText("File A5")).toBeInTheDocument();
            expect(screen.getByText("File B5")).toBeInTheDocument();
        });

        it("should mark selected item", () => {
            renderStaticTreeView({ selectedItemId: "parent-a-folder-a-file-a" });

            const selectedItemDiv = screen
                .getByText("Parent A Folder A File A1")
                .closest(`[role="treeitem"]`);

            expect(selectedItemDiv).toHaveAttribute("aria-selected", "true");
        });

        it("should mark disabled item", () => {
            renderStaticTreeView();

            const selectedItemDiv = screen.getByText("File A5").closest(`[role="treeitem"]`);

            expect(selectedItemDiv).toHaveAttribute("aria-disabled", "true");
        });

        it("should call onSelect when item is clicked", () => {
            const onSelect = vi.fn();
            renderStaticTreeView({ onSelect });

            fireEvent.click(screen.getByText("Parent A Folder A File A1"));

            expect(onSelect).toHaveBeenCalledWith(
                treeStatic[0].children[0].children[0].item,
                { newTab: false, type: "mouse" },
                expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }),
            );
        });

        it("should not call onSelect when item is clicked", () => {
            const onSelect = vi.fn();
            renderStaticTreeView({ onSelect });

            fireEvent.click(screen.getByText("File A5"));

            expect(onSelect).not.toHaveBeenCalled();
        });

        it("should navigate with keyboard arrows down up", () => {
            renderStaticTreeView();

            const tree = screen.getByRole("tree");

            // Initial focus is on first item
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));

            // Navigate down

            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent A Folder A").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent A Folder A File A1").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent A Folder B").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent A Folder B File A2").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent A File A3").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            // Skip disabled item
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent B").closest("div")).toHaveClass(e("item", { isFocused: true }));
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent B File A4").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            // Skip disabled item
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("File B5").closest("div")).toHaveClass(e("item", { isFocused: true }));
            fireEvent.keyDown(tree, { code: "ArrowDown" });

            // Navigate up

            // Skip disabled item
            fireEvent.keyDown(tree, { code: "ArrowUp" });
            expect(screen.getByText("Parent B File A4").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowUp" });
            expect(screen.getByText("Parent B").closest("div")).toHaveClass(e("item", { isFocused: true }));
            fireEvent.keyDown(tree, { code: "ArrowUp" });

            // Skip disabled item
            expect(screen.getByText("Parent A File A3").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowUp" });
            expect(screen.getByText("Parent A Folder B File A2").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowUp" });
            expect(screen.getByText("Parent A Folder B").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowUp" });
            expect(screen.getByText("Parent A Folder A File A1").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowUp" });
            expect(screen.getByText("Parent A Folder A").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowUp" });
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));
        });

        it("should navigate with keyboard arrows down up in collapsed", () => {
            renderStaticTreeView1({
                expandedMode: "default-collapsed",
            });

            const tree = screen.getByRole("tree");

            // Initial focus is on first item
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));

            // Navigate down
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent B").closest("div")).toHaveClass(e("item", { isFocused: true }));
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent B").closest("div")).toHaveClass(e("item", { isFocused: true }));

            // Navigate up
            fireEvent.keyDown(tree, { code: "ArrowUp" });
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));
            fireEvent.keyDown(tree, { code: "ArrowUp" });
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));
        });

        it("should navigate with keyboard home, end", () => {
            renderStaticTreeView();

            const tree = screen.getByRole("tree");

            // Initial focus is on first item
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));

            // Navigate emd
            fireEvent.keyDown(tree, { code: "End" });
            expect(screen.getByText("File B5").closest("div")).toHaveClass(e("item", { isFocused: true }));

            // Navigate home
            fireEvent.keyDown(tree, { code: "Home" });
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));
        });

        it("should navigate with keyboard arrows home end in collapsed", () => {
            renderStaticTreeView1({
                expandedMode: "default-collapsed",
            });

            const tree = screen.getByRole("tree");

            // Initial focus is on first item
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));

            // Navigate down
            fireEvent.keyDown(tree, { code: "End" });
            expect(screen.getByText("Parent B").closest("div")).toHaveClass(e("item", { isFocused: true }));
            fireEvent.keyDown(tree, { code: "End" });
            expect(screen.getByText("Parent B").closest("div")).toHaveClass(e("item", { isFocused: true }));

            // Navigate up
            fireEvent.keyDown(tree, { code: "Home" });
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));
            fireEvent.keyDown(tree, { code: "ArrowUp" });
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));
        });

        it("should navigate with keyboard, check boundaries", () => {
            renderStaticTreeView();

            const tree = screen.getByRole("tree");

            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));
            fireEvent.keyDown(tree, { code: "ArrowUp" });
            fireEvent.keyDown(tree, { code: "ArrowUp" });
            fireEvent.keyDown(tree, { code: "ArrowUp" });
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));

            fireEvent.keyDown(tree, { code: "Home" });
            fireEvent.keyDown(tree, { code: "Home" });
            fireEvent.keyDown(tree, { code: "Home" });
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));

            fireEvent.keyDown(tree, { code: "End" });

            expect(screen.getByText("File B5").closest("div")).toHaveClass(e("item", { isFocused: true }));
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("File B5").closest("div")).toHaveClass(e("item", { isFocused: true }));

            fireEvent.keyDown(tree, { code: "End" });
            fireEvent.keyDown(tree, { code: "End" });
            fireEvent.keyDown(tree, { code: "End" });
            expect(screen.getByText("File B5").closest("div")).toHaveClass(e("item", { isFocused: true }));
        });

        it("should navigate with keyboard right, expanding levels", () => {
            renderStaticTreeView({
                expandedMode: "default-collapsed",
            });

            const tree = screen.getByRole("tree");

            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));
            expect(screen.getByText("Parent A")).toBeInTheDocument();
            expect(screen.queryByText("Parent A Folder A")).toBe(null);
            expect(screen.queryByText("Parent A Folder A File A1")).toBe(null);
            expect(screen.queryByText("Parent A Folder B")).toBe(null);
            expect(screen.queryByText("Parent A Folder B File A2")).toBe(null);

            fireEvent.keyDown(tree, { code: "ArrowRight" });

            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));
            expect(screen.getByText("Parent A")).toBeInTheDocument();
            expect(screen.getByText("Parent A Folder A")).toBeInTheDocument();
            expect(screen.queryByText("Parent A Folder A File A1")).toBe(null);
            expect(screen.getByText("Parent A Folder B")).toBeInTheDocument();
            expect(screen.queryByText("Parent A Folder B File A2")).toBe(null);

            fireEvent.keyDown(tree, { code: "ArrowRight" });

            expect(screen.getByText("Parent A Folder A").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            expect(screen.getByText("Parent A")).toBeInTheDocument();
            expect(screen.getByText("Parent A Folder A")).toBeInTheDocument();
            expect(screen.queryByText("Parent A Folder A File A1")).toBe(null);
            expect(screen.getByText("Parent A Folder B")).toBeInTheDocument();
            expect(screen.queryByText("Parent A Folder B File A2")).toBe(null);

            fireEvent.keyDown(tree, { code: "ArrowRight" });

            expect(screen.getByText("Parent A Folder A").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            expect(screen.getByText("Parent A")).toBeInTheDocument();
            expect(screen.getByText("Parent A Folder A")).toBeInTheDocument();
            expect(screen.getByText("Parent A Folder A File A1")).toBeInTheDocument();
            expect(screen.getByText("Parent A Folder B")).toBeInTheDocument();
            expect(screen.queryByText("Parent A Folder B File A2")).toBe(null);

            fireEvent.keyDown(tree, { code: "ArrowRight" });
            expect(screen.getByText("Parent A Folder A File A1").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowRight" });
            expect(screen.getByText("Parent A Folder A File A1").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
        });

        it("should navigate with keyboard left, collapsing levels", () => {
            renderStaticTreeView({
                selectedItemId: "parent-a-folder-a-file-a",
            });

            const tree = screen.getByRole("tree");
            expect(screen.getByText("Parent A Folder A File A1").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            expect(screen.getByText("Parent A Folder A File A1")).toBeInTheDocument();

            fireEvent.keyDown(tree, { code: "ArrowLeft" });
            expect(screen.getByText("Parent A Folder A").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            expect(screen.getByText("Parent A Folder A File A1")).toBeInTheDocument();

            fireEvent.keyDown(tree, { code: "ArrowLeft" });
            expect(screen.getByText("Parent A Folder A").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            expect(screen.queryByText("Parent A Folder A File A1")).toBe(null);

            fireEvent.keyDown(tree, { code: "ArrowLeft" });
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));
            expect(screen.getByText("Parent A Folder A")).toBeInTheDocument();

            fireEvent.keyDown(tree, { code: "ArrowLeft" });
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));
            expect(screen.queryByText("Parent A Folder A")).toBe(null);
        });

        it("should select with Enter key", () => {
            const onSelect = vi.fn();
            renderStaticTreeView({ onSelect });

            const listbox = screen.getByRole("tree");

            // Navigate to second item
            fireEvent.keyDown(listbox, { code: "ArrowDown" });

            // Select with Enter
            fireEvent.keyDown(listbox, { code: "Enter" });

            expect(onSelect).toHaveBeenCalledWith(
                treeStatic[0].children[0].item,
                { newTab: false, type: "keyboard" },
                expect.objectContaining({ nativeEvent: expect.any(KeyboardEvent) }),
            );
        });

        it("should select with Space key", () => {
            const onSelect = vi.fn();
            renderStaticTreeView({ onSelect });

            const listbox = screen.getByRole("tree");

            // Navigate to second item
            fireEvent.keyDown(listbox, { code: "ArrowDown" });

            // Select with Enter
            fireEvent.keyDown(listbox, { code: "Space" });

            expect(onSelect).toHaveBeenCalledWith(
                treeStatic[0].children[0].item,
                { newTab: false, type: "keyboard" },
                expect.objectContaining({ nativeEvent: expect.any(KeyboardEvent) }),
            );
        });

        it("should toggle with Enter key", () => {
            const onSelect = vi.fn();
            renderStaticTreeView({ onSelect, selectionMode: "leafs-only" });

            const listbox = screen.getByRole("tree");
            expect(screen.getByText("Parent A").closest(`[role="treeitem"]`)).toHaveAttribute(
                "aria-expanded",
                "true",
            );

            // Toggle with Enter
            fireEvent.keyDown(listbox, { code: "Enter" });

            expect(screen.getByText("Parent A").closest(`[role="treeitem"]`)).toHaveAttribute(
                "aria-expanded",
                "false",
            );

            // Toggle with Enter
            fireEvent.keyDown(listbox, { code: "Enter" });

            expect(screen.getByText("Parent A").closest(`[role="treeitem"]`)).toHaveAttribute(
                "aria-expanded",
                "true",
            );
        });

        it("should close with Escape key", () => {
            const onClose = vi.fn();
            renderStaticTreeView({ onClose });

            const tree = screen.getByRole("tree");

            // Press Escape
            fireEvent.keyDown(tree, { code: "Escape" });

            expect(onClose).toHaveBeenCalled();
        });

        it("should update aria-activedescendant when navigating", () => {
            renderStaticTreeView();

            const tree = screen.getByRole("tree");

            // Initial focus is on first item
            expect(tree).toHaveAttribute("aria-activedescendant", `test-treeview/0`);

            // Navigate down
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(tree).toHaveAttribute("aria-activedescendant", `test-treeview/0-0`);

            // Navigate down
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(tree).toHaveAttribute("aria-activedescendant", `test-treeview/0-0-0`);
        });

        it("should call onClose after selection", () => {
            const onSelect = vi.fn();
            const onClose = vi.fn();
            renderStaticTreeView({ onSelect, onClose });

            // Click on an item
            fireEvent.click(screen.getByText("Parent A Folder A File A1"));

            expect(onSelect).toHaveBeenCalledWith(
                treeStatic[0].children[0].children[0].item,
                { newTab: false, type: "mouse" },
                expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }),
            );
            expect(onClose).toHaveBeenCalled();
        });

        it("should apply maxWidth style when provided", () => {
            const maxWidth = 300;
            renderStaticTreeView({ maxWidth });

            const listboxContainer = document.querySelector(`.${b()}`);
            expect(listboxContainer).toHaveStyle({ maxWidth: `${maxWidth}px` });
        });

        it("should call onUnhandledKeyDown for unhandled key events", () => {
            const onUnhandledKeyDown = vi.fn();
            renderStaticTreeView({ onUnhandledKeyDown });

            const tree = screen.getByRole("tree");

            // Press a character key
            fireEvent.keyDown(tree, { key: "a" });

            expect(onUnhandledKeyDown).toHaveBeenCalled();
            expect(onUnhandledKeyDown.mock.calls[0][0].key).toBe("a");
            expect(onUnhandledKeyDown.mock.calls[0][1]).toHaveProperty("items", treeStatic);
        });

        it("should allow focusing disabled items when isDisabledFocusable is true", () => {
            renderStaticTreeView({ isDisabledFocusable: true });

            const tree = screen.getByRole("tree");

            // Initial focus is on first item
            expect(screen.getByText("Parent A").closest("div")).toHaveClass(e("item", { isFocused: true }));

            // Navigate down

            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent A Folder A").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent A Folder A File A1").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent A Folder B").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent A Folder B File A2").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent A File A3").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent A File B3").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent B").closest("div")).toHaveClass(e("item", { isFocused: true }));
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("Parent B File A4").closest("div")).toHaveClass(
                e("item", { isFocused: true }),
            );
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("File A5").closest("div")).toHaveClass(e("item", { isFocused: true }));
            fireEvent.keyDown(tree, { code: "ArrowDown" });
            expect(screen.getByText("File B5").closest("div")).toHaveClass(e("item", { isFocused: true }));
            fireEvent.keyDown(tree, { code: "ArrowDown" });
        });

        it("should maintain proper aria attributes", () => {
            renderStaticTreeView();

            const tree = screen.getByRole("tree");

            // Check that tree has proper ARIA attributes
            expect(tree).toHaveAttribute("id", "test-treeview");
            expect(tree).toHaveAttribute("aria-label", "test-treeview-label");
            expect(tree).toHaveAttribute("aria-labelledby", "test-treeview-labelledby");
            expect(tree).toHaveAttribute("role", "tree");

            // Check that items have proper ARIA attributes
            const items = screen.getAllByRole("treeitem");
            expect(items.length).toBe(11);

            // First item should have aria-selected="true" by default
            expect(items[0]).toHaveAttribute("aria-selected", "true");
            expect(items[0]).toHaveAttribute("aria-expanded", "true");

            // Disabled item should have aria-disabled="true"
            expect(items[6]).toHaveAttribute("aria-disabled", "true");
        });

        it("should not close on select when shouldCloseOnSelect is false", () => {
            const onSelect = vi.fn();
            const onClose = vi.fn();

            renderStaticTreeView({
                onSelect,
                onClose,
                shouldCloseOnSelect: false,
            });

            // Click on an item
            fireEvent.click(screen.getByText("Parent A Folder A File A1"));

            // onSelect should be called
            expect(onSelect).toHaveBeenCalledWith(
                treeStatic[0].children[0].children[0].item,
                { newTab: false, type: "mouse" },
                expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }),
            );

            // onClose should not be called
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe("UiLeveledTreeview", () => {
        it("should render all items in default expanded mode", () => {
            renderLeveledTreeView();

            expect(screen.getByText("Parent A")).toBeInTheDocument();
            expect(screen.getByText("Folder A")).toBeInTheDocument();
            expect(screen.getByText("Folder B")).toBeInTheDocument();
            expect(screen.getByText("Parent B")).toBeInTheDocument();
            expect(screen.getByText("File A1")).toBeInTheDocument();
            expect(screen.getByText("File B1")).toBeInTheDocument();
            expect(screen.getByText("Parent C")).toBeInTheDocument();
            expect(screen.getByText("File A2")).toBeInTheDocument();
            expect(screen.getByText("File B2")).toBeInTheDocument();
        });
    });
});
