// (C) 2024-2026 GoodData Corporation

import cx from "classnames";

import { type TextContentObject } from "../../../model.js";
import { MarkdownComponent } from "../contents/Markdown.js";

export type ConversationTextContentProps = {
    text: string;
    objects?: TextContentObject[];
    useMarkdown?: boolean;
    isLoading?: boolean;
};

export function ConversationTextContent({
    text,
    objects = [],
    useMarkdown = false,
}: ConversationTextContentProps) {
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--text",
    );

    return (
        <div className={classNames}>
            <MarkdownComponent allowMarkdown={useMarkdown} references={objects}>
                {text}
            </MarkdownComponent>
        </div>
    );
}
