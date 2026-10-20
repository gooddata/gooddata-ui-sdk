// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { type IGenAiClarifyingAnswer } from "@gooddata/sdk-model";
import { bemFactory } from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocalItem, type TextContentObject } from "../../../model.js";
import type { IChatMessagesGroup } from "../../utils/groupUtility.js";
import { MarkdownComponent } from "../contents/Markdown.js";

import { useConversationClarifyingRelatedQuestions } from "./useConversationClarifyingRelatedQuestions.js";

const bem = bemFactory("gd-gen-ai-chat-clarifying-questions");

export type ConversationClarifyingAnswersContentProps = {
    message: IChatConversationLocalItem;
    groups: IChatMessagesGroup[];
    objects?: TextContentObject[];
    useMarkdown?: boolean;
    answers: IGenAiClarifyingAnswer[];
    isLast?: boolean;
};

export function ConversationClarifyingAnswersContent(props: ConversationClarifyingAnswersContentProps) {
    const { answers, message, objects = [], groups, useMarkdown = false } = props;
    const questions = useConversationClarifyingRelatedQuestions(groups, message);

    if (questions.length === 0) {
        return (
            <div className="gd-gen-ai-chat__conversation__item__content--error">
                <FormattedMessage
                    id="gd.gen-ai.conversationContents.clarifyingAnswers.missing-error"
                    values={{
                        b: (chunk) => <strong>{chunk}</strong>,
                    }}
                />
            </div>
        );
    }

    return (
        <div className={cx("gd-gen-ai-chat__conversation__item__content", bem.b())}>
            {questions.map((question, index) => {
                const labelId = `${message.id}-clarifying-answer-${index}`;
                const answer = answers.find((ans) => ans.questionIndex === index);

                return (
                    <div key={index}>
                        <div className={bem.e("header")} id={labelId}>
                            {question.text}
                        </div>
                        {answer ? (
                            <div aria-labelledby={labelId}>
                                <MarkdownComponent allowMarkdown={useMarkdown} references={objects}>
                                    {answer.answer.optionText}
                                </MarkdownComponent>
                            </div>
                        ) : (
                            <div aria-labelledby={labelId}>
                                <FormattedMessage id="gd.gen-ai.conversationContents.clarifyingAnswers.skipped" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
