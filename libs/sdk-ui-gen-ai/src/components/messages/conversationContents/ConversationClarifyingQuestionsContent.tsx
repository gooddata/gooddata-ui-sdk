// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { type IGenAiClarifyingQuestion } from "@gooddata/sdk-model";
import { UiButton, UiIcon, bemFactory, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocalItem, type TextContentObject } from "../../../model.js";
import { MarkdownComponent } from "../contents/Markdown.js";

import { SKIP_BUTTON_ID, useConversationClarifyingQuestions } from "./useConversationClarifyingQuestions.js";

const bem = bemFactory("gd-gen-ai-chat-clarifying-questions");

export type ConversationClarifyingQuestionsContentProps = {
    message: IChatConversationLocalItem;
    objects?: TextContentObject[];
    useMarkdown?: boolean;
    questions: IGenAiClarifyingQuestion[];
    isLast?: boolean;
};

export function ConversationClarifyingQuestionsContent(props: ConversationClarifyingQuestionsContentProps) {
    const { questions, message, objects = [], useMarkdown = false, isLast } = props;
    const intl = useIntl();
    const labelId = useIdPrefixed("clarifyingQuestion");

    const { question, index, ref, onSelectOption, keyboardHandler, currentStep, totalSteps } =
        useConversationClarifyingQuestions({
            questions,
            message,
            objects,
            isLast,
        });

    // Message clarifying questions are filled.
    if (message.filled) {
        return null;
    }

    return (
        <div
            className={cx("gd-gen-ai-chat__conversation__item__content", bem.b())}
            tabIndex={0}
            onKeyDown={keyboardHandler}
            ref={ref.ref}
            aria-activedescendant={`${labelId}-option-${index}`}
        >
            <div className={bem.e("header")} id={labelId}>
                {question.text}
            </div>
            {question.control.options.map((option, i) => (
                <div
                    key={i}
                    id={`${labelId}-option-${i}`}
                    className={bem.e("option", { focused: index === i })}
                    aria-selected={index === i}
                    aria-label={option.label}
                    aria-describedby={labelId}
                    onClick={() => onSelectOption(question, i)}
                >
                    <div className={bem.e("option-index")}>{i + 1}</div>
                    <div className={bem.e("option-content")}>
                        <MarkdownComponent allowMarkdown={useMarkdown} references={objects}>
                            {option.label}
                        </MarkdownComponent>
                    </div>
                    <div className={bem.e("option-select")}>
                        <UiIcon type="arrowRight" color="complementary-7" size={14} />
                    </div>
                </div>
            ))}
            <div className={bem.e("footer")}>
                <div>
                    <FormattedMessage
                        id="gd.gen-ai.clarification-question.of"
                        values={{
                            index: currentStep,
                            total: totalSteps,
                        }}
                    />
                </div>
                <UiButton
                    dataId={SKIP_BUTTON_ID}
                    label={intl.formatMessage({ id: "gd.gen-ai.clarification-question.skip-button" })}
                    onClick={() => {
                        onSelectOption(question, -1);
                    }}
                />
            </div>
        </div>
    );
}
