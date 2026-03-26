// (C) 2024-2026 GoodData Corporation

import cx from "classnames";

import { MarkdownComponent } from "../contents/Markdown.js";

export type ConversationErrorContentProps = {
    message: string;
    useMarkdown?: boolean;
    className?: string;
    isLoading?: boolean;
};

export function ConversationErrorContent({
    message,
    useMarkdown = false,
    className,
}: ConversationErrorContentProps) {
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--error",
        className,
    );

    return (
        <div className={classNames}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{message}</MarkdownComponent>
        </div>
    );
}
