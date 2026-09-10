// (C) 2024-2026 GoodData Corporation

import { type KeyboardEvent, useCallback, useMemo, useState } from "react";

import { useDispatch } from "react-redux";

import { type IGenAiClarifyingQuestion } from "@gooddata/sdk-model";
import { makeLinearKeyboardNavigation, useUiAutofocusConnectors } from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocalItem, type TextContentObject, makeUserItem } from "../../../model.js";
import { filledFormAction, newMessageAction, refocusInput } from "../../../store/messages/messagesSlice.js";

export const SKIP_BUTTON_ID = "skip-button";

export interface IUseConversationClarifyingQuestionsProps {
    questions: IGenAiClarifyingQuestion[];
    message: IChatConversationLocalItem;
    objects?: TextContentObject[];
    isLast?: boolean;
}

export function useConversationClarifyingQuestions(props: IUseConversationClarifyingQuestionsProps) {
    const { questions, message, objects = [], isLast } = props;
    const dispatch = useDispatch();

    const [question, setQuestion] = useState<IGenAiClarifyingQuestion>(questions[0]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [index, setIndex] = useState(0);

    const ref = useUiAutofocusConnectors<HTMLDivElement>({
        active: isLast,
    });

    const onFinishAnswers = useCallback(
        (newAnswers: Record<string, string>) => {
            const entries = Object.entries(newAnswers);
            dispatch(
                filledFormAction({
                    assistantMessageId: message.localId,
                }),
            );
            if (entries.length > 0) {
                dispatch(
                    newMessageAction(
                        makeUserItem({
                            type: "text",
                            text: entries.map(([key, value]) => `**${key}**\n\n${value}`).join("\n\n"),
                            objects,
                        }),
                    ),
                );
            } else {
                dispatch(refocusInput());
            }
        },
        [objects, dispatch, message.localId],
    );

    const onSelectOption = useCallback(
        (question: IGenAiClarifyingQuestion, option: number) => {
            const newAnswers = {
                ...answers,
                ...(option === -1
                    ? {}
                    : {
                          [question.text]: question.control.options[option].text,
                      }),
            };
            setAnswers(newAnswers);

            const index = questions.indexOf(question);
            const nextQuestion = questions[index + 1];
            if (nextQuestion) {
                setQuestion(nextQuestion);
                setIndex(0);
                ref.element?.focus();
            } else {
                onFinishAnswers(newAnswers);
            }
        },
        [answers, onFinishAnswers, questions, ref.element],
    );

    const keyboardHandler = useMemo(() => {
        const keyDown = makeLinearKeyboardNavigation({
            onFocusNext: () => {
                setIndex((i) => Math.min(i + 1, question.control.options.length - 1));
            },
            onFocusPrevious: () => {
                setIndex((i) => Math.max(i - 1, 0));
            },
            onFocusFirst: () => {
                setIndex(0);
            },
            onFocusLast: () => {
                setIndex(question.control.options.length - 1);
            },
            onSelect: (e) => {
                if ((e.target as HTMLElement).getAttribute("data-id") === SKIP_BUTTON_ID) {
                    onSelectOption(question, -1);
                    return;
                }
                onSelectOption(question, index);
            },
        });

        return (e: KeyboardEvent<HTMLDivElement>) => {
            ref.onKeyDown?.(e);
            keyDown(e);
        };
    }, [index, onSelectOption, question, ref]);

    return {
        question,
        index,
        ref,
        onSelectOption,
        keyboardHandler,
        currentStep: questions.indexOf(question) + 1,
        totalSteps: questions.length,
    };
}
