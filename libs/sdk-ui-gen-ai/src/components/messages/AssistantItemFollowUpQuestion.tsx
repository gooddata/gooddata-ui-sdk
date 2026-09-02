// (C) 2026 GoodData Corporation

import { type IChatConversationLocalItem, type TextContentObject } from "../../model.js";

import { MarkdownComponent } from "./contents/Markdown.js";

/**
 * @internal
 */
export interface IAssistantItemFollowUpQuestionProps {
    message: IChatConversationLocalItem;
    question: string;
    references: TextContentObject[];
}

/**
 * @internal
 */
export function AssistantItemFollowUpQuestion({ question, references }: IAssistantItemFollowUpQuestionProps) {
    return (
        <div className="gd-gen-ai-chat__conversation__visualization__followUp">
            <MarkdownComponent allowMarkdown references={references ?? []}>
                {question}
            </MarkdownComponent>
        </div>
    );
}
