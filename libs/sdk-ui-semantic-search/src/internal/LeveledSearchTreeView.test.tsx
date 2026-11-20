// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, within } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { type GenAIObjectType } from "@gooddata/sdk-model";
import { UiTreeViewEventsProvider, useUiTreeViewEventPublisher } from "@gooddata/sdk-ui-kit";

import { semanticSearchItem, semanticSearchItemTitle } from "../automation/testIds.js";
import { DEFAULT_MESSAGES } from "../localization/translations.js";

import {
    LeveledSearchTreeView,
    type LeveledSearchTreeViewProps,
    type SearchTreeViewItem,
} from "./LeveledSearchTreeView.js";

const objectTypes: GenAIObjectType[] = [
    "dashboard",
    "visualization",
    "metric",
    "dataset",
    "attribute",
    "label",
    "fact",
    "date",
    "document",
];

function resultNode(type: GenAIObjectType, id: string = type, isDisabled = false): SearchTreeViewItem {
    const title = `${id} result`;
    return {
        item: {
            id,
            stringTitle: title,
            url: `/results/${id}`,
            isDisabled,
            data: { id, title, type, workspaceId: "workspace" },
        },
    };
}

function relationshipNode(
    sourceObjectType: GenAIObjectType,
    targetObjectType: GenAIObjectType = "metric",
): NonNullable<SearchTreeViewItem["children"]>[number] {
    const id = `${sourceObjectType}-related`;
    return {
        item: {
            id,
            stringTitle: id,
            url: `/related/${id}`,
            data: {
                sourceWorkspaceId: "workspace",
                sourceObjectId: id,
                sourceObjectTitle: id,
                sourceObjectType,
                targetWorkspaceId: "workspace",
                targetObjectId: "metric",
                targetObjectTitle: "metric result",
                targetObjectType,
            },
        },
    };
}

function treeComponent(props: LeveledSearchTreeViewProps) {
    return (
        <IntlProvider locale="en-US" messages={DEFAULT_MESSAGES["en-US"]}>
            <LeveledSearchTreeView {...props} />
        </IntlProvider>
    );
}

function renderTree(overrides: Partial<LeveledSearchTreeViewProps> = {}) {
    const onSelect = vi.fn();
    const onFocus = vi.fn();
    const props: LeveledSearchTreeViewProps = {
        id: "search-tree",
        items: [resultNode("dashboard")],
        onSelect,
        onFocus,
        ...overrides,
    };
    const result = render(treeComponent(props));
    return {
        ...result,
        onSelect,
        onFocus,
        rerenderTree: (changes: Partial<LeveledSearchTreeViewProps>) =>
            result.rerender(treeComponent({ ...props, ...changes })),
    };
}

function getResult(title: string) {
    return screen.getByRole("treeitem", { name: new RegExp(`^${title},`) });
}

function getWrapper(item: HTMLElement) {
    return item.closest(`[data-testid="${semanticSearchItem}"]`)!;
}

function SearchKeyboardInput() {
    const publishKeyDown = useUiTreeViewEventPublisher("keydown");
    return <input aria-label="Search" onKeyDown={publishKeyDown} />;
}

describe("LeveledSearchTreeView", () => {
    it("keeps all result types, order, labels and icons when no link policy is supplied", () => {
        renderTree({ items: objectTypes.map((type) => resultNode(type)) });

        expect(screen.getByRole("tree", { name: "Semantic search tree" })).toBeInTheDocument();
        expect(screen.getAllByTestId(semanticSearchItemTitle).map((item) => item.textContent)).toEqual(
            objectTypes.map((type) => `${type} result`),
        );
        for (const type of objectTypes) {
            const item = getResult(`${type} result`);
            expect(item.tagName).toBe("A");
            expect(item).toHaveAttribute("href", `/results/${type}`);
            expect(within(item).getByRole("img", { name: type })).toBeInTheDocument();
            expect(getWrapper(item)).not.toHaveClass("gd-semantic-search__results-item--inactive");
        }
    });

    it("retains mixed inactive results, order, labels, icons, counts and permission locks", () => {
        const items = objectTypes.map((type) => resultNode(type, type, type === "dataset"));
        items[2] = { ...items[2]!, children: [relationshipNode("dashboard"), relationshipNode("attribute")] };
        renderTree({ items, isLinkEnabled: (type) => type === "dashboard" });

        expect(screen.getAllByTestId(semanticSearchItemTitle).map((item) => item.textContent)).toEqual(
            objectTypes.map((type) => `${type} result`),
        );
        for (const type of objectTypes) {
            const item = getResult(`${type} result`);
            expect(within(item).getByRole("img", { name: type })).toBeInTheDocument();
            expect(getWrapper(item).classList.contains("gd-semantic-search__results-item--inactive")).toBe(
                type !== "dashboard",
            );
            expect(item.tagName).toBe(type === "dashboard" ? "A" : "DIV");
        }
        expect(within(getResult("metric result")).getByText("2 results")).toBeInTheDocument();
        expect(within(getResult("dataset result")).getAllByRole("img", { hidden: true })).toHaveLength(2);
        expect(within(getResult("attribute result")).getAllByRole("img", { hidden: true })).toHaveLength(1);
    });

    it("preserves permission-lock selection behavior independently of link policy", () => {
        const item = resultNode("dashboard", "locked-dashboard", true);
        const { onSelect } = renderTree({ items: [item], isLinkEnabled: () => true });

        fireEvent.click(getResult("locked-dashboard result"));

        expect(onSelect).toHaveBeenCalledWith(item.item, { type: "mouse", newTab: false }, expect.anything());
    });

    it.each([
        ["left", "click", { button: 0 }],
        ["Ctrl", "click", { button: 0, ctrlKey: true }],
        ["Meta", "click", { button: 0, metaKey: true }],
        ["Shift", "click", { button: 0, shiftKey: true }],
        ["Alt", "click", { button: 0, altKey: true }],
        ["middle", "auxClick", { button: 1 }],
    ] as const)("does not select inactive leaves on %s clicks", (_name, event, options) => {
        const { onSelect } = renderTree({ items: [resultNode("metric")], isLinkEnabled: () => false });
        const item = getResult("metric result");

        expect(item).not.toHaveAttribute("href");
        fireEvent(item, new MouseEvent(event.toLowerCase(), { bubbles: true, cancelable: true, ...options }));

        expect(onSelect).not.toHaveBeenCalled();
    });

    it.each(["Enter", "Space"])("expands inactive groups but does not select leaves on %s", (code) => {
        const { onSelect } = renderTree({
            items: [
                resultNode("metric"),
                { ...resultNode("attribute"), children: [relationshipNode("dashboard")] },
            ],
            isLinkEnabled: () => false,
        });
        const tree = screen.getByRole("tree");

        fireEvent.keyDown(tree, { code });
        expect(onSelect).not.toHaveBeenCalled();
        fireEvent.keyDown(tree, { code: "ArrowDown" });
        fireEvent.keyDown(tree, { code });

        expect(getResult("attribute result")).toHaveAttribute("aria-expanded", "true");
        expect(getResult("dashboard-related")).not.toHaveAttribute("href");
        fireEvent.keyDown(tree, { code: "ArrowRight" });
        expect(tree).toHaveAttribute("aria-activedescendant", getResult("dashboard-related").id);
        fireEvent.keyDown(tree, { code });
        expect(onSelect).not.toHaveBeenCalled();
        fireEvent.keyDown(tree, { code: "ArrowLeft" });
        fireEvent.keyDown(tree, { code });

        expect(getResult("attribute result")).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByText("dashboard-related")).not.toBeInTheDocument();
        expect(onSelect).not.toHaveBeenCalled();
    });

    it.each(["Enter", "Space"])("preserves expansion and selection guards for forwarded %s", (code) => {
        const onSelect = vi.fn();
        render(
            <UiTreeViewEventsProvider>
                <SearchKeyboardInput />
                {treeComponent({
                    id: "search-tree",
                    items: [
                        resultNode("metric"),
                        { ...resultNode("attribute"), children: [relationshipNode("dashboard")] },
                    ],
                    onSelect,
                    isLinkEnabled: () => false,
                })}
            </UiTreeViewEventsProvider>,
        );
        const input = screen.getByRole("textbox", { name: "Search" });

        fireEvent.keyDown(input, { code });
        expect(onSelect).not.toHaveBeenCalled();
        fireEvent.keyDown(input, { code: "ArrowDown" });
        expect(screen.getByRole("tree")).toHaveAttribute(
            "aria-activedescendant",
            getResult("attribute result").id,
        );
        fireEvent.keyDown(input, { code });

        expect(getResult("attribute result")).toHaveAttribute("aria-expanded", "true");
        expect(getResult("dashboard-related")).not.toHaveAttribute("href");
        fireEvent.keyDown(input, { code: "ArrowRight" });
        expect(screen.getByRole("tree")).toHaveAttribute(
            "aria-activedescendant",
            getResult("dashboard-related").id,
        );
        fireEvent.keyDown(input, { code });
        expect(onSelect).not.toHaveBeenCalled();
        fireEvent.keyDown(input, { code: "ArrowLeft" });
        fireEvent.keyDown(input, { code });

        expect(getResult("attribute result")).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByText("dashboard-related")).not.toBeInTheDocument();
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("keeps inactive groups navigable and expandable using arrow keys", () => {
        const { onSelect, onFocus } = renderTree({
            items: [
                { ...resultNode("metric"), children: [relationshipNode("dashboard")] },
                resultNode("document"),
            ],
            isLinkEnabled: (type) => type === "dashboard",
        });
        const tree = screen.getByRole("tree");
        const parent = getResult("metric result");

        expect(tree).toHaveAttribute("aria-activedescendant", parent.id);
        expect(getWrapper(parent)).toHaveClass("gd-semantic-search__results-item--active");

        fireEvent.keyDown(tree, { code: "ArrowRight" });
        expect(parent).toHaveAttribute("aria-expanded", "true");
        fireEvent.keyDown(tree, { code: "ArrowRight" });
        expect(tree).toHaveAttribute("aria-activedescendant", getResult("dashboard-related").id);
        fireEvent.keyDown(tree, { code: "ArrowLeft" });
        expect(tree).toHaveAttribute("aria-activedescendant", parent.id);
        fireEvent.keyDown(tree, { code: "ArrowLeft" });
        expect(parent).toHaveAttribute("aria-expanded", "false");
        fireEvent.keyDown(tree, { code: "ArrowDown" });
        expect(tree).toHaveAttribute("aria-activedescendant", getResult("document result").id);
        fireEvent.keyDown(tree, { code: "ArrowUp" });
        expect(tree).toHaveAttribute("aria-activedescendant", parent.id);
        expect(onFocus).toHaveBeenLastCalledWith(parent.id);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("preserves focus on hover for inactive results", () => {
        const { onFocus } = renderTree({
            items: [resultNode("dashboard"), resultNode("metric")],
            isLinkEnabled: (type) => type === "dashboard",
        });
        const tree = screen.getByRole("tree");

        fireEvent.mouseEnter(getResult("metric result"));

        expect(tree).toHaveAttribute("aria-activedescendant", getResult("metric result").id);
        expect(getWrapper(getResult("metric result"))).toHaveClass(
            "gd-semantic-search__results-item--active",
        );
        expect(onFocus).toHaveBeenLastCalledWith(getResult("metric result").id);
    });

    it.each([
        ["left", "click", { button: 0 }],
        ["modified", "click", { button: 0, ctrlKey: true, metaKey: true, shiftKey: true }],
        ["middle", "auxClick", { button: 1 }],
    ] as const)("toggles inactive groups on %s row clicks without selecting", (_name, event, options) => {
        const { onSelect } = renderTree({
            items: [{ ...resultNode("metric"), children: [relationshipNode("dashboard")] }],
            isLinkEnabled: () => false,
        });
        const parent = getResult("metric result");

        fireEvent(
            within(parent).getByTestId(semanticSearchItemTitle),
            new MouseEvent(event.toLowerCase(), { bubbles: true, cancelable: true, ...options }),
        );

        expect(parent).toHaveAttribute("aria-expanded", "true");
        expect(getResult("dashboard-related")).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        expect(onSelect).not.toHaveBeenCalled();

        fireEvent(
            within(parent).getByTestId(semanticSearchItemTitle),
            new MouseEvent(event.toLowerCase(), { bubbles: true, cancelable: true, ...options }),
        );

        expect(parent).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByText("dashboard-related")).not.toBeInTheDocument();
        expect(onSelect).not.toHaveBeenCalled();
    });

    it.each(["Enter", "Space"])("keeps enabled leaves selectable with %s", (code) => {
        const item = resultNode("dashboard");
        const { onSelect } = renderTree({ items: [item], isLinkEnabled: () => true });

        fireEvent.keyDown(screen.getByRole("tree"), { code });

        expect(onSelect).toHaveBeenCalledExactlyOnceWith(
            item.item,
            { type: "keyboard", newTab: false },
            expect.anything(),
        );
    });

    it("evaluates relationship source types independently from parent and target types", () => {
        const children = objectTypes.map((type) => relationshipNode(type, "document"));
        const { onSelect } = renderTree({
            items: [{ ...resultNode("metric"), children }],
            isLinkEnabled: (type) => type === "dashboard",
        });

        fireEvent.click(getResult("metric result"));

        expect(screen.getAllByTestId(semanticSearchItemTitle).map((item) => item.textContent)).toEqual([
            "metric result",
            ...objectTypes.map((type) => `${type}-related`),
        ]);
        for (const type of objectTypes) {
            const child = getResult(`${type}-related`);
            expect(within(child).getByRole("img", { name: type })).toBeInTheDocument();
            expect(child.tagName).toBe(type === "dashboard" ? "A" : "DIV");
            fireEvent.click(child);
        }

        expect(onSelect).toHaveBeenCalledExactlyOnceWith(
            children[0]!.item,
            { type: "mouse", newTab: false },
            expect.anything(),
        );
    });

    it("does not inherit an enabled parent's policy for an inactive child", () => {
        const { onSelect } = renderTree({
            items: [{ ...resultNode("metric"), children: [relationshipNode("dashboard")] }],
            isLinkEnabled: (type) => type === "metric",
        });
        const parent = getResult("metric result");

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        fireEvent.click(parent);

        const child = getResult("dashboard-related");
        expect(parent).toHaveAttribute("aria-expanded", "true");
        expect(child).not.toHaveAttribute("href");
        fireEvent.click(child);
        fireEvent.keyDown(screen.getByRole("tree"), { code: "ArrowRight" });
        fireEvent.keyDown(screen.getByRole("tree"), { code: "Enter" });

        expect(onSelect).not.toHaveBeenCalled();
    });

    it("updates policy without remounting rows or losing expansion and keyboard focus", () => {
        const child = relationshipNode("dashboard");
        const { rerenderTree, onSelect } = renderTree({
            items: [{ ...resultNode("metric"), children: [child] }],
            isLinkEnabled: (type) => type === "dashboard",
        });
        const tree = screen.getByRole("tree");
        fireEvent.keyDown(tree, { code: "ArrowRight" });
        fireEvent.keyDown(tree, { code: "ArrowRight" });
        const parentWrapper = getWrapper(getResult("metric result"));
        const childWrapper = getWrapper(getResult("dashboard-related"));
        const focusedId = getResult("dashboard-related").id;

        rerenderTree({ isLinkEnabled: (type) => type === "metric" });

        expect(screen.getByRole("tree")).toBe(tree);
        expect(getWrapper(getResult("metric result"))).toBe(parentWrapper);
        expect(getWrapper(getResult("dashboard-related"))).toBe(childWrapper);
        expect(tree).toHaveAttribute("aria-activedescendant", focusedId);
        expect(getResult("metric result")).toHaveAttribute("aria-expanded", "true");
        expect(getResult("dashboard-related")).not.toHaveAttribute("href");
        fireEvent.keyDown(tree, { code: "Enter" });
        expect(onSelect).not.toHaveBeenCalled();

        rerenderTree({ isLinkEnabled: undefined });

        expect(getWrapper(getResult("dashboard-related"))).toBe(childWrapper);
        expect(tree).toHaveAttribute("aria-activedescendant", focusedId);
        expect(getResult("metric result")).toHaveAttribute("aria-expanded", "true");
        expect(getResult("dashboard-related")).toHaveAttribute("href", "/related/dashboard-related");
        fireEvent.keyDown(tree, { code: "Enter" });
        expect(onSelect).toHaveBeenCalledExactlyOnceWith(
            child.item,
            { type: "keyboard", newTab: false },
            expect.anything(),
        );
    });
});
