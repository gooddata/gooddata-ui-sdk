// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type GenAIObjectType,
    type ISemanticSearchRelationship,
    type ISemanticSearchResultItem,
} from "@gooddata/sdk-model";
import { BackendProvider } from "@gooddata/sdk-ui";

import { messagesSliceReducer, setCurrentConversationAction } from "../../../store/messages/messagesSlice.js";
import { type ConfigContext, ConfigProvider, type LinkHandlerEvent } from "../../ConfigContext.js";

import { SemanticSearchTreeView } from "./SemanticSearchTreeView.js";

const workspace = "workspace-1";
const objectTypes = ["metric", "visualization", "dashboard", "document"] as const;
const enabledPolicies = [
    { name: "unset", policy: undefined },
    { name: "always enabled", policy: () => true },
];

function makeResult(type: GenAIObjectType): ISemanticSearchResultItem {
    return { type, id: "result-1", workspaceId: workspace, title: "Search result" };
}

function makeRelationship(result: ISemanticSearchResultItem): ISemanticSearchRelationship {
    return {
        sourceObjectId: "dashboard-1",
        sourceObjectTitle: "Related dashboard",
        sourceObjectType: "dashboard",
        sourceWorkspaceId: workspace,
        targetObjectId: result.id,
        targetObjectTitle: result.title,
        targetObjectType: result.type,
        targetWorkspaceId: workspace,
    };
}

async function renderTree({
    result = makeResult("visualization"),
    relationships = [],
    isLinkEnabled,
}: {
    result?: ISemanticSearchResultItem;
    relationships?: ISemanticSearchRelationship[];
    isLinkEnabled?: ConfigContext["isLinkEnabled"];
} = {}) {
    const backend = recordedBackend({});
    const store = configureStore({ reducer: { messages: messagesSliceReducer } });
    store.dispatch(
        setCurrentConversationAction({
            conversation: {
                id: "thread-1",
                localId: "conversation-1",
                title: "Existing conversation",
                createdAt: "2026-01-01T00:00:00Z",
                updatedAt: "2026-01-01T00:00:00Z",
            },
        }),
    );
    const onLinkClick = vi.fn<NonNullable<ConfigContext["linkHandler"]>>((event) => {
        event.preventDefault();
        return undefined;
    });
    const view = (policy?: ConfigContext["isLinkEnabled"]) => (
        <BackendProvider backend={backend}>
            <Provider store={store}>
                <IntlProvider locale="en-US">
                    <ConfigProvider canAnalyze linkHandler={onLinkClick} isLinkEnabled={policy}>
                        <SemanticSearchTreeView
                            workspace={workspace}
                            searchResults={[result]}
                            relationships={relationships}
                            maxHeight={500}
                        />
                    </ConfigProvider>
                </IntlProvider>
            </Provider>
        </BackendProvider>
    );
    let rendered!: ReturnType<typeof render>;
    await act(async () => {
        rendered = render(view(isLinkEnabled));
    });

    return {
        onLinkClick,
        rerenderPolicy: (policy?: ConfigContext["isLinkEnabled"]) => rendered.rerender(view(policy)),
    };
}

function activateWithoutNavigation(element: HTMLElement) {
    fireEvent.click(element);
    fireEvent.click(element, { ctrlKey: true });
    fireEvent(element, new MouseEvent("auxclick", { button: 1, bubbles: true }));
    fireEvent.keyDown(screen.getByRole("tree"), { key: "Enter", code: "Enter" });
    fireEvent.keyDown(screen.getByRole("tree"), { key: " ", code: "Space" });
}

describe("SemanticSearchTreeView object-link policy", () => {
    describe.each(enabledPolicies)("$name policy", ({ policy }) => {
        it.each(objectTypes)("preserves %s leaf links and callback payloads", async (type) => {
            const { onLinkClick } = await renderTree({ result: makeResult(type), isLinkEnabled: policy });
            const title = screen.getByText("Search result");
            const link = title.closest("a");

            expect(link).toHaveAttribute("href", expect.any(String));
            fireEvent.click(title);
            fireEvent.click(title, { ctrlKey: true });
            fireEvent(title, new MouseEvent("auxclick", { button: 1, bubbles: true }));
            fireEvent.keyDown(screen.getByRole("tree"), { key: "Enter", code: "Enter" });

            expect(onLinkClick).toHaveBeenCalledTimes(4);
            expect(onLinkClick).toHaveBeenNthCalledWith(1, {
                id: "result-1",
                type,
                workspaceId: workspace,
                itemUrl: link!.getAttribute("href"),
                newTab: false,
                preventDefault: expect.any(Function) as LinkHandlerEvent["preventDefault"],
                action: "open",
                conversationId: "conversation-1",
            });
            expect(onLinkClick).toHaveBeenNthCalledWith(2, expect.objectContaining({ newTab: true }));
            expect(onLinkClick).toHaveBeenNthCalledWith(3, expect.objectContaining({ newTab: true }));
        });

        it("preserves relationship and Edit callbacks", async () => {
            const result = makeResult("visualization");
            const { onLinkClick } = await renderTree({
                result,
                relationships: [makeRelationship(result)],
                isLinkEnabled: policy,
            });

            fireEvent.click(screen.getByText(result.title));
            fireEvent.click(screen.getByText("Related dashboard"));

            expect(onLinkClick).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    id: "dashboard-1",
                    type: "dashboard",
                    workspaceId: workspace,
                    itemUrl: `/workspace/${workspace}/dashboards/#/dashboard/dashboard-1?visualizationId=result-1`,
                    action: "open",
                    conversationId: "conversation-1",
                }),
            );

            fireEvent.click(screen.getByText("Open"));

            expect(onLinkClick).toHaveBeenCalledTimes(2);
            expect(onLinkClick).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    id: "result-1",
                    type: "visualization",
                    itemUrl: `/workspace/${workspace}/analyze/#/result-1/edit`,
                }),
            );
        });
    });

    it.each(objectTypes)("never activates a disabled %s leaf", async (type) => {
        const isLinkEnabled = vi.fn<NonNullable<ConfigContext["isLinkEnabled"]>>(() => false);
        const { onLinkClick } = await renderTree({ result: makeResult(type), isLinkEnabled });
        const title = screen.getByText("Search result");

        expect(title.closest("a")).toBeNull();
        activateWithoutNavigation(title);

        expect(onLinkClick).not.toHaveBeenCalled();
        expect(isLinkEnabled).toHaveBeenCalledWith(type);
    });

    it.each(["metric", "visualization", "document"] as const)(
        "hides the Open action but keeps related dashboards usable under a disabled %s",
        async (disabledType) => {
            const result = makeResult(disabledType);
            const { onLinkClick } = await renderTree({
                result,
                relationships: [makeRelationship(result)],
                isLinkEnabled: (type) => type !== disabledType,
            });

            fireEvent.click(screen.getByText(result.title));
            expect(screen.getByText(result.title).closest("[role=treeitem]")).toHaveAttribute(
                "aria-expanded",
                "true",
            );
            expect(screen.queryByText("Open")).not.toBeInTheDocument();
            expect(screen.getAllByRole("treeitem")).toHaveLength(2);
            expect(onLinkClick).not.toHaveBeenCalled();

            const destination = screen.getByText("Related dashboard");
            expect(destination.closest("a")).toHaveAttribute("href", expect.stringContaining("dashboard-1"));
            fireEvent.click(destination);
            expect(onLinkClick).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ id: "dashboard-1", type: "dashboard" }),
            );

            fireEvent.click(screen.getByText(result.title));
            expect(screen.queryByText("Related dashboard")).not.toBeInTheDocument();
            expect(onLinkClick).toHaveBeenCalledOnce();
        },
    );

    it("disables a dashboard destination independently of its enabled parent and Edit action", async () => {
        const result = makeResult("visualization");
        const { onLinkClick } = await renderTree({
            result,
            relationships: [makeRelationship(result)],
            isLinkEnabled: (type) => type !== "dashboard",
        });

        fireEvent.click(screen.getByText(result.title));
        const destination = screen.getByText("Related dashboard");
        expect(destination.closest("a")).toBeNull();
        fireEvent.click(destination);
        fireEvent(destination, new MouseEvent("auxclick", { button: 1, bubbles: true }));
        fireEvent.keyDown(screen.getByRole("tree"), { key: "ArrowDown", code: "ArrowDown" });
        fireEvent.keyDown(screen.getByRole("tree"), { key: "Enter", code: "Enter" });
        expect(onLinkClick).not.toHaveBeenCalled();

        const edit = screen.getByText("Open");
        expect(edit.closest("a")).toHaveAttribute("href", `/workspace/${workspace}/analyze/#/result-1/edit`);
        fireEvent.click(edit);
        expect(onLinkClick).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ id: "result-1", type: "visualization" }),
        );
    });

    it("updates existing result links when the context policy changes", async () => {
        const { onLinkClick, rerenderPolicy } = await renderTree();

        rerenderPolicy(() => false);
        expect(screen.getByText("Search result").closest("a")).toBeNull();
        fireEvent.click(screen.getByText("Search result"));
        expect(onLinkClick).not.toHaveBeenCalled();

        rerenderPolicy(() => true);
        expect(screen.getByText("Search result").closest("a")).toHaveAttribute("href");
        fireEvent.click(screen.getByText("Search result"));
        expect(onLinkClick).toHaveBeenCalledOnce();
    });

    it("hides and restores the Open action when the policy changes without collapsing related results", async () => {
        const result = makeResult("visualization");
        const { onLinkClick, rerenderPolicy } = await renderTree({
            result,
            relationships: [makeRelationship(result)],
        });

        fireEvent.click(screen.getByText(result.title));
        expect(screen.getByText("Open").closest("a")).toHaveAttribute("href");

        rerenderPolicy((type) => type === "dashboard");
        expect(screen.queryByText("Open")).not.toBeInTheDocument();
        expect(screen.getByText("Related dashboard").closest("a")).toHaveAttribute("href");
        expect(screen.getByText(result.title).closest("[role=treeitem]")).toHaveAttribute(
            "aria-expanded",
            "true",
        );
        const tree = screen.getByRole("tree");
        fireEvent.keyDown(tree, { code: "ArrowRight" });
        fireEvent.keyDown(tree, { code: "ArrowDown" });
        fireEvent.keyDown(tree, { code: "Enter" });
        expect(onLinkClick).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ id: "dashboard-1", type: "dashboard" }),
        );

        rerenderPolicy();
        const open = screen.getByText("Open");
        expect(open.closest("a")).toHaveAttribute("href", `/workspace/${workspace}/analyze/#/result-1/edit`);
        fireEvent.click(open);
        expect(onLinkClick).toHaveBeenCalledTimes(2);
        expect(onLinkClick).toHaveBeenLastCalledWith(
            expect.objectContaining({ id: result.id, type: "visualization" }),
        );
    });
});
