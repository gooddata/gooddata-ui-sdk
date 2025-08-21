// (C) 2024-2025 GoodData Corporation

import React from "react";

import cx from "classnames";

import { MarkdownComponent } from "./Markdown.js";
import { ErrorContents } from "../../../model.js";

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
