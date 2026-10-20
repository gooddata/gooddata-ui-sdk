// (C) 2026 GoodData Corporation

import { type IGenAiClarifyingAnswer } from "@gooddata/sdk-model";

import { type ChatClarificationAnswer } from "../../events.js";

export function convertToChatClarificationAnswers(
    answers: IGenAiClarifyingAnswer[],
): ChatClarificationAnswer[] {
    return answers.map(({ questionIndex, questionText, answer }) => ({
        questionIndex,
        questionText,
        answer: {
            type: "singleChoice",
            optionIndex: answer.optionIndex,
            optionText: answer.optionText,
        },
    }));
}
