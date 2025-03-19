// (C) 2024 GoodData Corporation

import React from "react";
import { TextContents } from "../../../model.js";
import cx from "classnames";
import { MarkdownComponent } from "./Markdown.js";

export type TextContentsProps = {
    content: TextContents;
    useMarkdown?: boolean;
};

export const TextContentsComponent: React.FC<TextContentsProps> = ({ content, useMarkdown = false }) => {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--text");

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{content.text}</MarkdownComponent>
        </div>
    );
};
