// (C) 2024-2026 GoodData Corporation

import cx from "classnames";

import { type ErrorContents } from "../../../model.js";

import { MarkdownComponent } from "./Markdown.js";

export type ErrorContentsProps = {
    content: ErrorContents;
    useMarkdown?: boolean;
};

export function ErrorContentsComponent({ content, useMarkdown }: ErrorContentsProps) {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--error");

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{content.text}</MarkdownComponent>
        </div>
    );
}
