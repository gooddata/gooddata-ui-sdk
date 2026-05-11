// (C) 2024-2026 GoodData Corporation

import cx from "classnames";

import { type TextContents } from "../../../model.js";

import { MarkdownComponent } from "./Markdown.js";

export type TextContentsProps = {
    content: TextContents;
    useMarkdown?: boolean;
};

export function TextContentsComponent({ content, useMarkdown = false }: TextContentsProps) {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--text");

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown} references={content.objects}>
                {content.text}
            </MarkdownComponent>
        </div>
    );
}
