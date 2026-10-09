// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { afterEach, describe, expect, it } from "vitest";

import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { WorkspaceProvider } from "@gooddata/sdk-ui";

import { DEFAULT_MESSAGES } from "../../../localization/translations.js";
import type { IChatConversationLocalItem, IChatConversationMultipartLocalPart } from "../../../model.js";
import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    setSettingsAction,
} from "../../../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "../../../store/messages/messagesSlice.js";
import { CustomizationProvider } from "../../CustomizationProvider.js";

import { ConversationMultipartContent } from "./ConversationMultipartContent.js";

const MESSAGE: IChatConversationLocalItem = {
    id: "item-1",
    type: "item",
    role: "assistant",
    createdAt: 0,
    content: { type: "multipart", parts: [] },
    localId: "local-1",
    responseId: "response-1",
};

const settings = (): IUserWorkspaceSettings => ({
    userId: "user-1",
    workspace: "ws-1",
    locale: "en-US",
    separators: { thousand: ",", decimal: "." },
    enableBusinessBriefingReportsApp: true,
});

function renderParts(parts: IChatConversationMultipartLocalPart[]) {
    const store = configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
            [messagesSliceName]: messagesSliceReducer,
        },
    });
    store.dispatch(setSettingsAction({ settings: settings() }));

    return render(
        <Provider store={store}>
            <IntlProvider locale="en-US" messages={DEFAULT_MESSAGES["en-US"]}>
                <WorkspaceProvider workspace="ws-1">
                    <CustomizationProvider>
                        <ConversationMultipartContent message={MESSAGE} parts={parts} references={[]} />
                    </CustomizationProvider>
                </WorkspaceProvider>
            </IntlProvider>
        </Provider>,
    );
}

afterEach(cleanup);

describe("ConversationMultipartContent", () => {
    it("shows a document part as a document card next to the text around it", () => {
        renderParts([
            { type: "text", text: "Here is the document." },
            {
                type: "publisherDocument",
                publisherDocument: {
                    type: "report",
                    title: "Quarterly review",
                    periodStart: "2026-01-01",
                    periodEnd: "2026-03-31",
                    content: { version: "1", pages: [] },
                },
            },
        ]);

        expect(screen.getByText("Here is the document.")).toBeTruthy();
        expect(screen.getByText("Quarterly review")).toBeTruthy();
    });

    it("offers to open a document part that changes a saved document", () => {
        renderParts([
            {
                type: "publisherDocument",
                baseDocumentId: "base-1",
                publisherDocument: {
                    type: "report",
                    title: "Quarterly review",
                    periodStart: "2026-01-01",
                    periodEnd: "2026-03-31",
                    content: { version: "1", pages: [] },
                },
            },
        ]);

        expect(screen.getByRole("button", { name: "Open" })).toBeTruthy();
    });

    it("says a document part that no longer resolves is unavailable", () => {
        renderParts([{ type: "publisherDocument", publisherDocument: null }]);

        expect(screen.getByText("The document is unavailable.")).toBeTruthy();
    });
});
