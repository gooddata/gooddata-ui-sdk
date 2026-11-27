// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { makeAssistantItem } from "../model.js";
import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
    setInputValueAction,
} from "../store/chatWindow/chatWindowSlice.js";
import { conversationMessagesSelector } from "../store/messages/messagesSelectors.js";
import {
    evaluateMessageAction,
    evaluateMessageCompleteAction,
    loadConversationSuccessAction,
    loadConversationsSuccessAction,
    loadThreadAction,
    messagesSliceName,
    messagesSliceReducer,
    setAgentsAction,
} from "../store/messages/messagesSlice.js";

import { CustomizationProvider } from "./CustomizationProvider.js";
import { type IGenAIAssistantSlots } from "./customized/types.js";
import { Input } from "./Input.js";

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    DefaultSyntaxHighlightingInput: function DefaultSyntaxHighlightingInput({
        value,
        onChange,
        onKeyDown,
    }: {
        value: string;
        onChange: (value: string) => void;
        onKeyDown: (event: KeyboardEvent) => boolean;
    }) {
        return (
            <textarea
                aria-label="Message"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => onKeyDown(event.nativeEvent)}
            />
        );
    },
}));

vi.mock("./GenAIChatContextIndicator.js", () => ({ GenAIChatContextIndicator: () => null }));
vi.mock("./GenAiChatContextChooser.js", () => ({ GenAiChatContextChooser: () => null }));

const conversation = {
    id: "conversation-1",
    localId: "conversation-1",
    title: "Conversation",
    createdAt: new Date(1).toISOString(),
    updatedAt: new Date(1).toISOString(),
    agentId: "agent-1",
};

function makeStore(isPreview = true) {
    const store = configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
            [messagesSliceName]: messagesSliceReducer,
        },
        preloadedState: {
            [chatWindowSliceName]: getInitialChatWindowState({ isPreview }),
        },
        // the dev checks print a warning when one takes longer than warnAfter (32ms by default), and
        // a warning fails the CI build; on a busy runner dispatches here can take ~50ms
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                immutableCheck: { warnAfter: 250 },
                serializableCheck: { warnAfter: 250 },
            }),
    });
    store.dispatch(loadConversationsSuccessAction({ conversations: [conversation] }));
    store.dispatch(
        loadConversationSuccessAction({ currentConversation: conversation, conversationItems: [] }),
    );
    store.dispatch(setAgentsAction({ agents: [{ id: "agent-1", title: "Agent" }] }));
    return store;
}

function renderInput(store: ReturnType<typeof makeStore>, slots?: IGenAIAssistantSlots) {
    return render(
        <Provider store={store}>
            <IntlProvider locale="en" messages={{ "gd.gen-ai.button.send": "Send" }} onError={() => {}}>
                <CustomizationProvider slots={slots}>
                    <Input />
                </CustomizationProvider>
            </IntlProvider>
        </Provider>,
    );
}

const CustomSendButton: NonNullable<IGenAIAssistantSlots["SendButton"]> = ({ defaultProps }) => (
    <button type="button" disabled={defaultProps.isDisabled} onClick={defaultProps.onClick}>
        {defaultProps.isInProgress ? "Generating" : "Custom send"}
    </button>
);

describe("user message submission", () => {
    it.each(
        [".", "#", "+", "-", "(", ")", "[", "]", "\\", "\\#"].flatMap((character) =>
            ["button", "keyboard"].map((method) => ({ text: `test${character}`, method })),
        ),
    )("preserves $text when sent using the $method", ({ text, method }) => {
        const store = makeStore();
        renderInput(store);

        fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
        if (method === "button") {
            fireEvent.click(screen.getByRole("button", { name: "Send" }));
        } else {
            fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
        }

        expect(conversationMessagesSelector(store.getState())).toEqual([
            expect.objectContaining({
                role: "user",
                content: { type: "text", text, objects: [] },
            }),
        ]);
        expect(screen.getByRole("textbox")).toHaveValue("");
    });
});

describe("SendButton slot", () => {
    it.each([true, false])(
        "replaces the default button and sends the current input (preview: %s)",
        (isPreview) => {
            const store = makeStore(isPreview);
            renderInput(store, { SendButton: CustomSendButton });

            expect(screen.queryByTestId("send_message")).not.toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Custom send" })).toBeDisabled();

            fireEvent.change(screen.getByRole("textbox"), { target: { value: "Show revenue" } });
            fireEvent.click(screen.getByRole("button", { name: "Custom send" }));

            expect(conversationMessagesSelector(store.getState())).toEqual([
                expect.objectContaining({
                    role: "user",
                    content: expect.objectContaining({ text: "Show revenue" }),
                }),
            ]);
            expect(screen.getByRole("textbox")).toHaveValue("");
        },
    );

    it("passes response progress separately from loading and resets it on completion", () => {
        const store = makeStore();
        renderInput(store, { SendButton: CustomSendButton });
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "Next question" } });

        act(() => store.dispatch(loadThreadAction()));
        expect(screen.getByRole("button", { name: "Custom send" })).toBeDisabled();

        const message = makeAssistantItem();
        act(() => store.dispatch(evaluateMessageAction({ message, conversationId: conversation.localId })));
        expect(screen.getByRole("button", { name: "Generating" })).toBeDisabled();

        act(() =>
            store.dispatch(
                evaluateMessageCompleteAction({
                    assistantMessageId: message.localId,
                    conversationId: conversation.localId,
                }),
            ),
        );
        expect(screen.getByRole("button", { name: "Custom send" })).toBeEnabled();
    });

    it.each(["", "   ", "generating", "loading agents"])(
        "guards the callback even if a custom button ignores the disabled state: %j",
        (state) => {
            const store = makeStore(state !== "loading agents");
            store.dispatch(setInputValueAction({ value: state === "   " ? state : state ? "Question" : "" }));
            if (state === "generating") {
                store.dispatch(
                    evaluateMessageAction({
                        message: makeAssistantItem(),
                        conversationId: conversation.localId,
                    }),
                );
            }
            if (state === "loading agents") {
                store.dispatch(setAgentsAction({ agents: undefined }));
            }
            const messagesBefore = conversationMessagesSelector(store.getState());
            renderInput(store, {
                SendButton: ({ defaultProps }) => <button onClick={defaultProps.onClick}>Send anyway</button>,
            });

            fireEvent.click(screen.getByRole("button", { name: "Send anyway" }));

            expect(conversationMessagesSelector(store.getState())).toEqual(messagesBefore);
        },
    );

    it("keeps the no-agent message instead of rendering a send button", () => {
        const store = makeStore(false);
        store.dispatch(setAgentsAction({ agents: [] }));
        renderInput(store, { SendButton: CustomSendButton });

        expect(screen.getByTestId("no_agent_available")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Custom send" })).not.toBeInTheDocument();
    });

    it("allows a slot to reuse the default component", () => {
        renderInput(makeStore(), {
            SendButton: ({ Default, defaultProps }) => <Default {...defaultProps} />,
        });

        expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
        expect(screen.getByTestId("send_message")).toBeInTheDocument();
    });

    it("preserves default sending and disables the button during response generation", () => {
        const store = makeStore();
        renderInput(store);
        const button = screen.getByRole("button", { name: "Send" });
        expect(button).toBeDisabled();

        fireEvent.change(screen.getByRole("textbox"), { target: { value: "Show revenue" } });
        expect(button).toBeEnabled();
        fireEvent.click(button);
        expect(conversationMessagesSelector(store.getState())).toHaveLength(1);

        act(() =>
            store.dispatch(
                evaluateMessageAction({ message: makeAssistantItem(), conversationId: conversation.localId }),
            ),
        );
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "Next question" } });
        expect(button).toBeDisabled();
        fireEvent.click(button);
        expect(conversationMessagesSelector(store.getState())).toHaveLength(2);
    });

    it("keeps Enter submission when the button is customized", () => {
        const store = makeStore();
        renderInput(store, { SendButton: CustomSendButton });
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "Show revenue" } });
        fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });

        expect(conversationMessagesSelector(store.getState())).toHaveLength(1);
        expect(screen.getByRole("textbox")).toHaveValue("");
    });
});
