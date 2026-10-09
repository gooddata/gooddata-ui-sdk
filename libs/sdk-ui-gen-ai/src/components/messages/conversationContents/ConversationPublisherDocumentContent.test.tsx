// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IPublisherDocumentDefinition, type IPublisherDocumentPage, idRef } from "@gooddata/sdk-model";
import { WorkspaceProvider } from "@gooddata/sdk-ui";

import { DEFAULT_MESSAGES } from "../../../localization/translations.js";
import type { IChatConversationLocalItem } from "../../../model.js";
import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    setAmbientUserContextAction,
    setIsPreviewAction,
    setSettingsAction,
} from "../../../store/chatWindow/chatWindowSlice.js";
import {
    messagesSliceName,
    messagesSliceReducer,
    setCurrentConversationAction,
} from "../../../store/messages/messagesSlice.js";
import { createEmptyConversation } from "../../../store/utils.js";
import { ConfigProvider, type LinkHandlerEvent } from "../../ConfigContext.js";

import { ConversationPublisherDocumentContent } from "./ConversationPublisherDocumentContent.js";

const MESSAGE: IChatConversationLocalItem = {
    id: "item-1",
    type: "item",
    role: "assistant",
    createdAt: new Date(2026, 8, 30, 12, 0).getTime(),
    content: { type: "multipart", parts: [] },
    localId: "local-1",
    responseId: "response-1",
};

const settings = (
    isPublisherAppEnabled: boolean,
    isContextSetupEnabled: boolean,
): IUserWorkspaceSettings => ({
    userId: "user-1",
    workspace: "ws-1",
    locale: "en-US",
    separators: { thousand: ",", decimal: "." },
    enableBusinessBriefingReportsApp: isPublisherAppEnabled,
    enableAiContextSetup: isContextSetupEnabled,
});

const PAGE: IPublisherDocumentPage = {
    localIdentifier: "p1",
    layout: { type: "slotRef", slotId: "s1" },
    slots: [],
};

const DOCUMENT: IPublisherDocumentDefinition = {
    type: "report",
    title: "Quarterly review",
    periodStart: "2026-01-01",
    periodEnd: "2026-03-31",
    content: { version: "1", pages: [PAGE, PAGE] },
};

function renderCard({
    saved,
    baseDocumentId,
    publisherDocument: publisherDocument = DOCUMENT,
    isPublisherAppEnabled = true,
    isPreview = false,
    isContextSetupEnabled = true,
    conversationId = "conv-1",
    message = MESSAGE,
    allowNativeLinks,
    openDocumentId,
    openDraftRef,
    linkHandler = vi.fn(),
}: {
    saved?: string | null;
    baseDocumentId?: string | null;
    publisherDocument?: IPublisherDocumentDefinition | null;
    isPublisherAppEnabled?: boolean;
    isPreview?: boolean;
    isContextSetupEnabled?: boolean;
    conversationId?: string | null;
    message?: IChatConversationLocalItem;
    allowNativeLinks?: boolean;
    openDocumentId?: string;
    openDraftRef?: string;
    linkHandler?: (event: LinkHandlerEvent) => string | undefined;
} = {}) {
    const store = configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
            [messagesSliceName]: messagesSliceReducer,
        },
    });
    store.dispatch(setSettingsAction({ settings: settings(isPublisherAppEnabled, isContextSetupEnabled) }));
    store.dispatch(setIsPreviewAction({ isPreview }));
    if (openDocumentId !== undefined || openDraftRef !== undefined) {
        store.dispatch(
            setAmbientUserContextAction({
                userContext: {
                    view: {
                        publisherDocument: {
                            ref: openDocumentId === undefined ? undefined : idRef(openDocumentId, "report"),
                            title: "Open",
                            definition: DOCUMENT,
                            draftRef: openDraftRef,
                        },
                    },
                },
            }),
        );
    }
    if (conversationId !== null) {
        store.dispatch(
            setCurrentConversationAction({
                conversation: { ...createEmptyConversation(), id: conversationId },
            }),
        );
    }

    const view = render(
        <Provider store={store}>
            <IntlProvider locale="en-US" messages={DEFAULT_MESSAGES["en-US"]}>
                <WorkspaceProvider workspace="ws-1">
                    <ConfigProvider linkHandler={linkHandler} allowNativeLinks={allowNativeLinks}>
                        <ConversationPublisherDocumentContent
                            message={message}
                            publisherDocument={publisherDocument}
                            saved={saved}
                            baseDocumentId={baseDocumentId}
                        />
                    </ConfigProvider>
                </WorkspaceProvider>
            </IntlProvider>
        </Provider>,
    );
    return { view, linkHandler };
}

const openButton = () => screen.getByRole("button", { name: "Open" });

const originalLocation = Object.getOwnPropertyDescriptor(window, "location");

afterEach(() => {
    cleanup();
    if (originalLocation) {
        Object.defineProperty(window, "location", originalLocation);
    }
});

describe("ConversationPublisherDocumentContent", () => {
    it("only ever offers to open, even a change to the document that is open", () => {
        renderCard({ baseDocumentId: "base-1", openDocumentId: "base-1" });

        expect(openButton()).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
    });

    it("names the document, the period it covers and how many pages it has", () => {
        renderCard();

        expect(screen.getByText("Quarterly review")).toBeTruthy();
        expect(screen.getByText(/^Jan 1\s*–\s*Mar 31, 2026 · 2 pages$/)).toBeTruthy();
    });

    it("says page, not pages, for a one-page document", () => {
        renderCard({ publisherDocument: { ...DOCUMENT, content: { version: "1", pages: [PAGE] } } });

        expect(screen.getByText(/ · 1 page$/)).toBeTruthy();
    });

    it("shows only the page count when the period is not a date", () => {
        renderCard({ publisherDocument: { ...DOCUMENT, periodStart: "soon", periodEnd: "later" } });

        expect(screen.getByText("2 pages")).toBeTruthy();
    });

    it("opens an unsaved document as a draft that names its conversation and message", () => {
        const { linkHandler } = renderCard();

        fireEvent.click(openButton());

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "report",
                id: "item-1",
                workspaceId: "ws-1",
                newTab: false,
                action: "open",
                itemUrl: "/workspace/ws-1/publisher/new?conversation=conv-1&item=item-1",
            }),
        );
    });

    it("opens a saved document as that document, with the chat's version", () => {
        const { linkHandler } = renderCard({ saved: "r/1" });

        fireEvent.click(openButton());

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "report",
                id: "r/1",
                itemUrl: "/workspace/ws-1/publisher/report/r%2F1?conversation=conv-1&item=item-1",
            }),
        );
    });

    it("opens a saved document as that document, without the draft, while the conversation is not saved", () => {
        const { linkHandler } = renderCard({ saved: "r/1", conversationId: "" });

        fireEvent.click(openButton());

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({ itemUrl: "/workspace/ws-1/publisher/report/r%2F1" }),
        );
    });

    it("offers to open the saved document with the draft when that document is not the one open", () => {
        const { linkHandler } = renderCard({ baseDocumentId: "base-1", openDocumentId: "other" });

        expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
        fireEvent.click(openButton());

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "report",
                id: "item-1",
                itemUrl: "/workspace/ws-1/publisher/report/base-1?conversation=conv-1&item=item-1",
            }),
        );
    });

    it("offers to open the saved document with the draft when no document is open", () => {
        const { linkHandler } = renderCard({ baseDocumentId: "base-1" });

        fireEvent.click(openButton());

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                itemUrl: "/workspace/ws-1/publisher/report/base-1?conversation=conv-1&item=item-1",
            }),
        );
    });

    it("opens the changes when they modify the document that is open", () => {
        const { linkHandler } = renderCard({ baseDocumentId: "base-1", openDocumentId: "base-1" });

        fireEvent.click(openButton());

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                itemUrl: "/workspace/ws-1/publisher/report/base-1?conversation=conv-1&item=item-1",
            }),
        );
    });

    it("offers to open the document when the app's open document is not known", () => {
        renderCard({ baseDocumentId: "base-1", openDocumentId: "base-1", isContextSetupEnabled: false });

        expect(openButton()).toBeTruthy();
    });

    it("offers to open a new document even while another document is open", () => {
        renderCard({ openDocumentId: "base-1" });

        expect(openButton()).toBeTruthy();
    });

    it("opens the chat's version of a document that was saved, while that document is open", () => {
        const { linkHandler } = renderCard({
            baseDocumentId: "base-1",
            saved: "base-1",
            openDocumentId: "base-1",
        });

        fireEvent.click(openButton());

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                itemUrl: "/workspace/ws-1/publisher/report/base-1?conversation=conv-1&item=item-1",
            }),
        );
    });

    it("offers to open a saved document that is not the open one", () => {
        renderCard({ saved: "r1", openDocumentId: "other" });

        expect(openButton()).toBeTruthy();
    });

    it("opens a rework of the unsaved document open in the editor", () => {
        renderCard({ openDraftRef: "report_9" });

        expect(openButton()).toBeTruthy();
    });

    it("offers to open a rework when no document is open", () => {
        renderCard();

        expect(openButton()).toBeTruthy();
    });

    it("opens a new version of the unsaved draft that is open", () => {
        const { linkHandler } = renderCard({ openDraftRef: "report_1" });

        fireEvent.click(openButton());

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                itemUrl: "/workspace/ws-1/publisher/new?conversation=conv-1&item=item-1",
            }),
        );
    });

    it("offers to open a new version of a draft other than the one open", () => {
        renderCard({ openDraftRef: "report_3" });

        expect(openButton()).toBeTruthy();
    });

    it("offers to open a first draft while another unsaved draft is open", () => {
        renderCard({ openDraftRef: "report_1" });

        expect(openButton()).toBeTruthy();
    });

    it("offers to open a new version of a draft while a saved document is open", () => {
        renderCard({ openDocumentId: "r9" });

        expect(openButton()).toBeTruthy();
    });

    it("offers to open a new version of the open draft once that version was saved as a document", () => {
        renderCard({ saved: "r9", openDraftRef: "report_1" });

        expect(openButton()).toBeTruthy();
    });

    it("offers to open a new version of the open draft when it edits a saved document", () => {
        renderCard({ baseDocumentId: "r5", openDraftRef: "report_1" });

        expect(openButton()).toBeTruthy();
    });

    it("cannot open changes before the conversation is saved", () => {
        const { linkHandler } = renderCard({
            baseDocumentId: "base-1",
            openDocumentId: "base-1",
            conversationId: "",
        });

        expect((openButton() as HTMLButtonElement).disabled).toBe(true);
        fireEvent.click(openButton());

        expect(linkHandler).not.toHaveBeenCalled();
    });

    it("asks for a new tab when the modifier key is held", () => {
        const { linkHandler } = renderCard();

        fireEvent.click(openButton(), { metaKey: true });

        expect(linkHandler).toHaveBeenCalledWith(expect.objectContaining({ newTab: true }));
    });

    it("assigns the location instead of calling the link handler when native links are allowed", () => {
        const location = { href: "" };
        Object.defineProperty(window, "location", { configurable: true, value: location });
        const { linkHandler } = renderCard({ allowNativeLinks: true });

        fireEvent.click(openButton());

        expect(location.href).toBe("/workspace/ws-1/publisher/new?conversation=conv-1&item=item-1");
        expect(linkHandler).not.toHaveBeenCalled();
    });

    it.each([
        ["there is no conversation", { conversationId: null }],
        ["the conversation is not saved yet", { conversationId: "" }],
        ["the message has no id yet", { message: { ...MESSAGE, id: "" } }],
    ])("cannot open a draft while %s", (_description, options) => {
        const { linkHandler } = renderCard(options);

        expect((openButton() as HTMLButtonElement).disabled).toBe(true);
        fireEvent.click(openButton());

        expect(linkHandler).not.toHaveBeenCalled();
    });

    it("says the document is unavailable when it no longer resolves", () => {
        renderCard({ publisherDocument: null });

        expect(screen.getByText("The document is unavailable.")).toBeTruthy();
    });

    it("shows nothing when the publisher app is off, since there is nowhere to open the document", () => {
        const { view } = renderCard({ isPublisherAppEnabled: false });

        expect(view.container.textContent).toBe("");
    });

    it("shows nothing in a preview conversation, which the publisher app cannot read", () => {
        const { view } = renderCard({ isPreview: true });

        expect(view.container.textContent).toBe("");
    });
});
