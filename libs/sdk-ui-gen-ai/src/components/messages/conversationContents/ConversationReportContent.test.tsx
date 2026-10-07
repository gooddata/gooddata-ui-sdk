// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IReportContentPage, type IReportDefinition, idRef } from "@gooddata/sdk-model";
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

import { ConversationReportContent } from "./ConversationReportContent.js";

const MESSAGE: IChatConversationLocalItem = {
    id: "item-1",
    type: "item",
    role: "assistant",
    createdAt: new Date(2026, 8, 30, 12, 0).getTime(),
    content: { type: "multipart", parts: [] },
    localId: "local-1",
    responseId: "response-1",
};

const settings = (isReportsAppEnabled: boolean, isContextSetupEnabled: boolean): IUserWorkspaceSettings => ({
    userId: "user-1",
    workspace: "ws-1",
    locale: "en-US",
    separators: { thousand: ",", decimal: "." },
    enableBusinessBriefingReportsApp: isReportsAppEnabled,
    enableAiContextSetup: isContextSetupEnabled,
});

const PAGE: IReportContentPage = {
    localIdentifier: "p1",
    layout: { type: "slotRef", slotId: "s1" },
    slots: [],
};

const REPORT: IReportDefinition = {
    type: "report",
    title: "Quarterly review",
    periodStart: "2026-01-01",
    periodEnd: "2026-03-31",
    content: { version: "1", pages: [PAGE, PAGE] },
};

function renderCard({
    saved,
    baseReportId,
    report = REPORT,
    isReportsAppEnabled = true,
    isPreview = false,
    isContextSetupEnabled = true,
    conversationId = "conv-1",
    message = MESSAGE,
    allowNativeLinks,
    openReportId,
    openDraftRef,
    linkHandler = vi.fn(),
}: {
    saved?: string | null;
    baseReportId?: string | null;
    report?: IReportDefinition | null;
    isReportsAppEnabled?: boolean;
    isPreview?: boolean;
    isContextSetupEnabled?: boolean;
    conversationId?: string | null;
    message?: IChatConversationLocalItem;
    allowNativeLinks?: boolean;
    openReportId?: string;
    openDraftRef?: string;
    linkHandler?: (event: LinkHandlerEvent) => string | undefined;
} = {}) {
    const store = configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
            [messagesSliceName]: messagesSliceReducer,
        },
    });
    store.dispatch(setSettingsAction({ settings: settings(isReportsAppEnabled, isContextSetupEnabled) }));
    store.dispatch(setIsPreviewAction({ isPreview }));
    if (openReportId !== undefined || openDraftRef !== undefined) {
        store.dispatch(
            setAmbientUserContextAction({
                userContext: {
                    view: {
                        report: {
                            ref: openReportId === undefined ? undefined : idRef(openReportId, "report"),
                            title: "Open",
                            definition: REPORT,
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
                        <ConversationReportContent
                            message={message}
                            report={report}
                            saved={saved}
                            baseReportId={baseReportId}
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

describe("ConversationReportContent", () => {
    it("only ever offers to open, even a change to the report that is open", () => {
        renderCard({ baseReportId: "base-1", openReportId: "base-1" });

        expect(openButton()).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
    });

    it("names the report, the period it covers and how many pages it has", () => {
        renderCard();

        expect(screen.getByText("Quarterly review")).toBeTruthy();
        expect(screen.getByText(/^Jan 1\s*–\s*Mar 31, 2026 · 2 pages$/)).toBeTruthy();
    });

    it("says page, not pages, for a one-page report", () => {
        renderCard({ report: { ...REPORT, content: { version: "1", pages: [PAGE] } } });

        expect(screen.getByText(/ · 1 page$/)).toBeTruthy();
    });

    it("shows only the page count when the period is not a date", () => {
        renderCard({ report: { ...REPORT, periodStart: "soon", periodEnd: "later" } });

        expect(screen.getByText("2 pages")).toBeTruthy();
    });

    it("opens an unsaved report as a draft that names its conversation and message", () => {
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

    it("opens a saved report as that report, with the chat's version", () => {
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

    it("opens a saved report as that report, without the draft, while the conversation is not saved", () => {
        const { linkHandler } = renderCard({ saved: "r/1", conversationId: "" });

        fireEvent.click(openButton());

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({ itemUrl: "/workspace/ws-1/publisher/report/r%2F1" }),
        );
    });

    it("offers to open the saved report with the draft when that report is not the one open", () => {
        const { linkHandler } = renderCard({ baseReportId: "base-1", openReportId: "other" });

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

    it("offers to open the saved report with the draft when no report is open", () => {
        const { linkHandler } = renderCard({ baseReportId: "base-1" });

        fireEvent.click(openButton());

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                itemUrl: "/workspace/ws-1/publisher/report/base-1?conversation=conv-1&item=item-1",
            }),
        );
    });

    it("opens the changes when they modify the report that is open", () => {
        const { linkHandler } = renderCard({ baseReportId: "base-1", openReportId: "base-1" });

        fireEvent.click(openButton());

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                itemUrl: "/workspace/ws-1/publisher/report/base-1?conversation=conv-1&item=item-1",
            }),
        );
    });

    it("offers to open the report when the app's open report is not known", () => {
        renderCard({ baseReportId: "base-1", openReportId: "base-1", isContextSetupEnabled: false });

        expect(openButton()).toBeTruthy();
    });

    it("offers to open a new report even while another report is open", () => {
        renderCard({ openReportId: "base-1" });

        expect(openButton()).toBeTruthy();
    });

    it("opens the chat's version of a report that was saved, while that report is open", () => {
        const { linkHandler } = renderCard({
            baseReportId: "base-1",
            saved: "base-1",
            openReportId: "base-1",
        });

        fireEvent.click(openButton());

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                itemUrl: "/workspace/ws-1/publisher/report/base-1?conversation=conv-1&item=item-1",
            }),
        );
    });

    it("offers to open a saved report that is not the open one", () => {
        renderCard({ saved: "r1", openReportId: "other" });

        expect(openButton()).toBeTruthy();
    });

    it("opens a rework of the unsaved report open in the editor", () => {
        renderCard({ openDraftRef: "report_9" });

        expect(openButton()).toBeTruthy();
    });

    it("offers to open a rework when no report is open", () => {
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

    it("offers to open a new version of a draft while a saved report is open", () => {
        renderCard({ openReportId: "r9" });

        expect(openButton()).toBeTruthy();
    });

    it("offers to open a new version of the open draft once that version was saved as a report", () => {
        renderCard({ saved: "r9", openDraftRef: "report_1" });

        expect(openButton()).toBeTruthy();
    });

    it("offers to open a new version of the open draft when it edits a saved report", () => {
        renderCard({ baseReportId: "r5", openDraftRef: "report_1" });

        expect(openButton()).toBeTruthy();
    });

    it("cannot open changes before the conversation is saved", () => {
        const { linkHandler } = renderCard({
            baseReportId: "base-1",
            openReportId: "base-1",
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

    it("says the report is unavailable when it no longer resolves", () => {
        renderCard({ report: null });

        expect(screen.getByText("The report is unavailable.")).toBeTruthy();
    });

    it("shows nothing when the reports app is off, since there is nowhere to open the report", () => {
        const { view } = renderCard({ isReportsAppEnabled: false });

        expect(view.container.textContent).toBe("");
    });

    it("shows nothing in a preview conversation, which the reports app cannot read", () => {
        const { view } = renderCard({ isPreview: true });

        expect(view.container.textContent).toBe("");
    });
});
