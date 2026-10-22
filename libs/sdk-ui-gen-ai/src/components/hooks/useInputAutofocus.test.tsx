// (C) 2026 GoodData Corporation

import { type EditorView } from "@codemirror/view";
import { configureStore } from "@reduxjs/toolkit";
import { act, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, describe, expect, it } from "vitest";

import { type IChatConversationLocal } from "../../model.js";
import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
} from "../../store/chatWindow/chatWindowSlice.js";
import {
    clearConversationSuccessAction,
    messagesSliceName,
    messagesSliceReducer,
} from "../../store/messages/messagesSlice.js";

import { useInputAutofocus } from "./useInputAutofocus.js";

function createStore() {
    return configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
            [messagesSliceName]: messagesSliceReducer,
        },
        preloadedState: {
            [chatWindowSliceName]: getInitialChatWindowState(),
        },
    });
}

function switchConversation(store: ReturnType<typeof createStore>, localId: string) {
    store.dispatch(
        clearConversationSuccessAction({
            conversation: { localId } as IChatConversationLocal,
            threadId: localId,
        }),
    );
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

function mountEditor() {
    const contentDOM = document.createElement("div");
    contentDOM.tabIndex = 0;
    document.body.appendChild(contentDOM);

    return { contentDOM, editorApi: { contentDOM } as unknown as EditorView };
}

function TestInput({ editorApi }: { editorApi: EditorView }) {
    const ref = useInputAutofocus(editorApi, true, { isBusy: false, refocusKey: 0 });

    return <div {...ref} />;
}

afterEach(() => {
    document.body.innerHTML = "";
});

function renderInput(store: ReturnType<typeof createStore>, editorApi: EditorView) {
    return render(
        <Provider store={store}>
            <TestInput editorApi={editorApi} />
        </Provider>,
    );
}

describe("useInputAutofocus", () => {
    it("focuses the editor when the chat lands in another conversation", async () => {
        const store = createStore();
        switchConversation(store, "conversation-1");
        const { contentDOM, editorApi } = mountEditor();
        renderInput(store, editorApi);
        await nextFrame();

        const elsewhere = document.createElement("button");
        document.body.appendChild(elsewhere);
        elsewhere.focus();

        act(() => switchConversation(store, "conversation-2"));
        await nextFrame();

        expect(contentDOM).toHaveFocus();
    });

    it("leaves focus alone while the conversation stays the same", async () => {
        const store = createStore();
        switchConversation(store, "conversation-1");
        const { editorApi } = mountEditor();
        const { rerender } = renderInput(store, editorApi);
        await nextFrame();

        const elsewhere = document.createElement("button");
        document.body.appendChild(elsewhere);
        elsewhere.focus();

        rerender(
            <Provider store={store}>
                <TestInput editorApi={editorApi} />
            </Provider>,
        );
        await nextFrame();

        expect(elsewhere).toHaveFocus();
    });
});
