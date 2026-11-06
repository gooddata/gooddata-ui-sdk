// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { afterEach, describe, expect, it } from "vitest";

import { WorkspaceProvider } from "@gooddata/sdk-ui";

import { DEFAULT_MESSAGES } from "../../localization/translations.js";
import type { IChatConversationLocalItem } from "../../model.js";
import { chatWindowSliceName, chatWindowSliceReducer } from "../../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "../../store/messages/messagesSlice.js";
import { CustomizationProvider } from "../CustomizationProvider.js";

import { AssistantItemComponent } from "./AssistantItem.js";

const ANSWER: IChatConversationLocalItem = {
    id: "item-1",
    type: "item",
    role: "assistant",
    createdAt: 0,
    content: { type: "text", text: "Revenue was **$1.2M**." },
    localId: "local-1",
    responseId: "",
    complete: true,
};

function renderAnswer(message: IChatConversationLocalItem) {
    const store = configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
            [messagesSliceName]: messagesSliceReducer,
        },
    });

    return render(
        <Provider store={store}>
            <IntlProvider locale="en-US" messages={DEFAULT_MESSAGES["en-US"]}>
                <WorkspaceProvider workspace="ws-1">
                    <CustomizationProvider>
                        <AssistantItemComponent
                            message={message}
                            groups={[{ type: "assistant", messages: [message] }]}
                            isLast
                        />
                    </CustomizationProvider>
                </WorkspaceProvider>
            </IntlProvider>
        </Provider>,
    );
}

afterEach(cleanup);

describe("AssistantItemComponent", () => {
    it("announces the answer once it finishes streaming", () => {
        const { container } = renderAnswer({ ...ANSWER, streaming: false });

        expect(container.querySelector("[aria-live]")?.textContent).toBe("Revenue was $1.2M.");
    });

    it("does not announce an answer loaded from history", () => {
        const { container } = renderAnswer(ANSWER);

        expect(container.querySelector("[aria-live]")?.textContent).toBe("");
    });

    it("keeps the chat input focused when the feedback button is pressed", () => {
        renderAnswer(ANSWER);

        const notPrevented = fireEvent.mouseDown(
            screen.getByRole("button", { name: "Mark this message as not helpful" }),
        );

        expect(notPrevented).toBe(false);
    });

    it("lets the feedback form take focus on mouse press", () => {
        renderAnswer(ANSWER);
        fireEvent.click(screen.getByRole("button", { name: "Mark this message as not helpful" }));

        const notPrevented = fireEvent.mouseDown(screen.getByRole("dialog"));

        expect(notPrevented).toBe(true);
    });
});
