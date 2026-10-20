// (C) 2024-2026 GoodData Corporation

import { type KeyboardEvent, useCallback, useMemo, useState } from "react";

import { useDispatch } from "react-redux";

import { type IGenAiClarifyingQuestion } from "@gooddata/sdk-model";
import { makeLinearKeyboardNavigation, useUiAutofocusConnectors } from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocalItem, type TextContentObject, makeUserItem } from "../../../model.js";
import { filledFormAction, newMessageAction } from "../../../store/messages/messagesSlice.js";

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
    const [answers, setAnswers] = useState<
        { question: string; answer: string; optionIndex: number; questionIndex: number }[]
    >([]);
    const [index, setIndex] = useState(0);

    const ref = useUiAutofocusConnectors<HTMLDivElement>({
        active: isLast,
    });

    const onFinishAnswers = useCallback(
        (newAnswers: { question: string; answer: string; optionIndex: number; questionIndex: number }[]) => {
            dispatch(
                filledFormAction({
                    assistantMessageId: message.localId,
                    responses: newAnswers.reduce(
                        (acc, { question, answer }) => {
                            acc[question] = answer;
                            return acc;
                        },
                        {} as Record<string, string>,
                    ),
                }),
            );
            dispatch(
                newMessageAction(
                    makeUserItem({
                        type: "clarifyingAnswers",
                        questionsItemId: message.id,
                        answers: newAnswers.map(({ question, answer, questionIndex, optionIndex }) => {
                            return {
                                questionText: question,
                                questionIndex,
                                answer: {
                                    optionIndex,
                                    optionText: answer,
                                    type: "singleChoice",
                                },
                            };
                        }),
                        objects,
                    }),
                ),
            );
        },
        [objects, dispatch, message.localId, message.id],
    );

    const onSelectOption = useCallback(
        (question: IGenAiClarifyingQuestion, option: number) => {
            const index = questions.indexOf(question);

            const newAnswers = [
                ...answers,
                ...(option === -1
                    ? []
                    : [
                          {
                              question: question.text,
                              answer: question.control.options[option].text,
                              optionIndex: option,
                              questionIndex: index,
                          },
                      ]),
            ];
            setAnswers(newAnswers);

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
