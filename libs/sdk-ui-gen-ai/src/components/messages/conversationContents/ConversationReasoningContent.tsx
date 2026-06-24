// (C) 2024-2026 GoodData Corporation

import cx from "classnames";

import type { TextContentObject } from "../../../model.js";
import { MarkdownComponent } from "../contents/Markdown.js";

export type ConversationReasoningContentProps = {
    summary: string;
    objects?: TextContentObject[];
    className?: string;
    useMarkdown?: boolean;
    isLoading?: boolean;
};

export function ConversationReasoningContent({
    summary,
    className,
    useMarkdown,
}: ConversationReasoningContentProps) {
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--reasoning",
        {
            "gd-gen-ai-chat__summary__empty": !summary,
        },
        className,
    );

    return (
        <div className={classNames}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{summary}</MarkdownComponent>
        </div>
    );
}
