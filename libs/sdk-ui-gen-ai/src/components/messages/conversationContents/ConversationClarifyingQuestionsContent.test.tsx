// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { type IGenAiClarifyingQuestion } from "@gooddata/sdk-model";
import { getFocusableElements } from "@gooddata/sdk-ui-kit";

import { DEFAULT_MESSAGES } from "../../../localization/translations.js";
import { type IChatConversationLocalItem } from "../../../model.js";
import { chatWindowSliceName, chatWindowSliceReducer } from "../../../store/chatWindow/chatWindowSlice.js";
import {
    filledFormAction,
    loadConversationSuccessAction,
    messagesSliceName,
    messagesSliceReducer,
    newMessageAction,
} from "../../../store/messages/messagesSlice.js";
import { createEmptyConversation } from "../../../store/utils.js";
import { ConfigProvider } from "../../ConfigContext.js";
import { REPLY_BOX_CLASS_NAME } from "../../constants.js";

import {
    ConversationClarifyingQuestionsContent,
    type ConversationClarifyingQuestionsContentProps,
} from "./ConversationClarifyingQuestionsContent.js";

const QUESTIONS: IGenAiClarifyingQuestion[] = [
    { text: "Which region?", control: { options: [{ text: "Europe" }, { text: "America" }] } },
    { text: "Which period?", control: { options: [{ text: "This year" }, { text: "Last year" }] } },
];

const MESSAGE: IChatConversationLocalItem = {
    id: "item-1",
    type: "item",
    role: "assistant",
    createdAt: 0,
    content: { type: "multipart", parts: [{ type: "clarifyingQuestions", questions: QUESTIONS }] },
    localId: "local-1",
    responseId: "response-1",
    streaming: true,
};

function renderQuestionnaire(
    overrides: Partial<ConversationClarifyingQuestionsContentProps> = {},
    allowNativeLinks = false,
) {
    const store = configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
            [messagesSliceName]: messagesSliceReducer,
        },
    });
    const props = { questions: QUESTIONS, message: MESSAGE, isLast: true, ...overrides };
    store.dispatch(
        loadConversationSuccessAction({
            currentConversation: createEmptyConversation(),
            conversationItems: [props.message],
        }),
    );
    const dispatch = vi.spyOn(store, "dispatch");
    const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
            <IntlProvider locale="en-US" messages={DEFAULT_MESSAGES["en-US"]}>
                <ConfigProvider allowNativeLinks={allowNativeLinks}>{children}</ConfigProvider>
            </IntlProvider>
        </Provider>
    );

    return {
        ...render(<ConversationClarifyingQuestionsContent {...props} />, { wrapper }),
        dispatch,
        props,
    };
}

function focusReplyBox(editor: "textarea" | "contenteditable" = "textarea") {
    render(
        <div className={REPLY_BOX_CLASS_NAME}>
            {editor === "textarea" ? (
                <textarea aria-label="Reply" />
            ) : (
                <div contentEditable role="textbox" aria-label="Reply" />
            )}
        </div>,
    );
    const input = screen.getByRole("textbox", { name: "Reply" });
    input.focus();
    return input;
}

async function nextFrame() {
    await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
    });
}

describe("ConversationClarifyingQuestionsContent", () => {
    it.each([false, true])(
        "excludes option chips and links from the tab order (native links: %s)",
        async (allowNativeLinks) => {
            const options = [
                { text: "{metric/revenue}" },
                { text: "[Dashboard](gooddata://dashboard?ws=workspace&id=dashboard)" },
            ];
            renderQuestionnaire(
                {
                    useMarkdown: true,
                    objects: [{ id: "revenue", type: "metric", title: "Revenue" }],
                    questions: [
                        {
                            text: "Which source?",
                            control: { options },
                        },
                        { ...QUESTIONS[1], control: { options: [...options].reverse() } },
                    ],
                },
                allowNativeLinks,
            );
            const questionnaire = screen.getByTestId("gen-ai-clarifying-questions");
            const skipButton = screen.getByRole("button", { name: "Skip" });
            await waitFor(() => expect(questionnaire).toHaveFocus());

            const contents = screen.getAllByTestId("gen-ai-clarifying-option-content");
            expect(contents[0]).toHaveTextContent("Revenue");
            expect(contents[0]).not.toHaveAttribute("inert");
            expect(contents[1]).not.toHaveAttribute("inert");
            expect(
                screen.getByRole(allowNativeLinks ? "link" : "button", { name: "Dashboard" }),
            ).toHaveAttribute("tabindex", "-1");
            expect(getFocusableElements(questionnaire, true).focusableElements).toEqual([skipButton]);

            fireEvent.keyDown(questionnaire, { key: "ArrowDown", code: "ArrowDown" });
            fireEvent.keyDown(questionnaire, { key: "Enter", code: "Enter" });

            expect(screen.getByTestId("gen-ai-clarifying-question")).toHaveTextContent("Which period?");
            expect(questionnaire).toHaveFocus();
            expect(getFocusableElements(questionnaire, true).focusableElements).toEqual([skipButton]);
        },
    );

    it("excludes reference chips from the tab order when Markdown is disabled", () => {
        renderQuestionnaire({
            isLast: false,
            objects: [{ id: "revenue", type: "metric", title: "Revenue" }],
            questions: [{ text: "Which metric?", control: { options: [{ text: "{metric/revenue}" }] } }],
        });

        const content = screen.getByTestId("gen-ai-clarifying-option-content");
        expect(content).toHaveTextContent("Revenue");
        expect(getFocusableElements(content, true).focusableElements).toEqual([]);
    });

    it("takes focus from the reply box for live questions and accepts answers using the keyboard", async () => {
        focusReplyBox();
        const { dispatch } = renderQuestionnaire();
        const questionnaire = screen.getByTestId("gen-ai-clarifying-questions");

        await waitFor(() => expect(questionnaire).toHaveFocus());

        fireEvent.keyDown(questionnaire, { key: "ArrowDown", code: "ArrowDown" });
        expect(questionnaire).toHaveAttribute(
            "aria-activedescendant",
            screen.getAllByTestId("gen-ai-clarifying-option")[1].id,
        );
        fireEvent.keyDown(questionnaire, { key: "Enter", code: "Enter" });

        expect(screen.getByTestId("gen-ai-clarifying-question")).toHaveTextContent("Which period?");
        expect(questionnaire).toHaveFocus();

        fireEvent.keyDown(questionnaire, { key: "Enter", code: "Enter" });

        expect(dispatch).toHaveBeenCalledWith(
            filledFormAction({
                assistantMessageId: MESSAGE.localId,
                responses: { "Which region?": "America", "Which period?": "This year" },
            }),
        );
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: newMessageAction.type,
                payload: expect.objectContaining({
                    content: expect.objectContaining({
                        type: "clarifyingAnswers",
                        questionsItemId: MESSAGE.id,
                    }),
                }),
            }),
        );
    });

    it("takes focus from the contenteditable reply editor", async () => {
        focusReplyBox("contenteditable");
        renderQuestionnaire();

        await waitFor(() => expect(screen.getByTestId("gen-ai-clarifying-questions")).toHaveFocus());
    });

    it("does not take focus from an unrelated text field", async () => {
        render(<textarea aria-label="Unrelated" />);
        const input = screen.getByRole("textbox", { name: "Unrelated" });
        input.focus();
        renderQuestionnaire();

        await nextFrame();

        expect(input).toHaveFocus();
    });

    it("returns focus to the questionnaire after skipping a question using the keyboard", async () => {
        renderQuestionnaire();
        await nextFrame();
        const skipButton = screen.getByRole("button", { name: "Skip" });
        skipButton.focus();

        fireEvent.keyDown(skipButton, { key: "Enter", code: "Enter" });

        expect(screen.getByTestId("gen-ai-clarifying-question")).toHaveTextContent("Which period?");
        expect(screen.getByTestId("gen-ai-clarifying-questions")).toHaveFocus();
    });

    it("does not take focus from the reply box when questions are restored from history", async () => {
        const input = focusReplyBox();
        renderQuestionnaire({ message: { ...MESSAGE, complete: true, streaming: false } });

        await nextFrame();

        expect(input).toHaveFocus();
    });

    it.each([
        { name: "history", message: { ...MESSAGE, complete: true, streaming: false }, isLast: true },
        { name: "non-last message", message: MESSAGE, isLast: false },
        { name: "unspecified last message", message: MESSAGE, isLast: undefined },
        { name: "filled questionnaire", message: { ...MESSAGE, filled: true }, isLast: true },
    ])("does not move existing button focus for a $name", async ({ message, isLast }) => {
        render(<button>Existing control</button>);
        const button = screen.getByRole("button", { name: "Existing control" });
        button.focus();
        renderQuestionnaire({ message, isLast });

        await nextFrame();

        expect(button).toHaveFocus();
    });

    it("does not refocus after message updates or completion", async () => {
        const input = focusReplyBox();
        const { props, rerender } = renderQuestionnaire();
        await waitFor(() => expect(screen.getByTestId("gen-ai-clarifying-questions")).toHaveFocus());
        await nextFrame();
        input.focus();

        rerender(<ConversationClarifyingQuestionsContent {...props} message={{ ...MESSAGE }} />);
        await nextFrame();
        expect(input).toHaveFocus();

        rerender(
            <ConversationClarifyingQuestionsContent
                {...props}
                message={{ ...MESSAGE, complete: true, streaming: false }}
            />,
        );
        await nextFrame();
        expect(input).toHaveFocus();
    });
});
