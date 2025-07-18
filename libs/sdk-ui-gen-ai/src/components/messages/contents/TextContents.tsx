// (C) 2024-2025 GoodData Corporation

import { TextContents } from "../../../model.js";
import cx from "classnames";
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
