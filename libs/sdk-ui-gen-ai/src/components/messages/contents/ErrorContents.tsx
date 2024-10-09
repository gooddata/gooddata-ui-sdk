// (C) 2024 GoodData Corporation

import React from "react";
import { ErrorContents } from "../../../model.js";
import cx from "classnames";
import { MarkdownComponent } from "./Markdown.js";

export type ErrorContentsProps = {
    content: ErrorContents;
    useMarkdown?: boolean;
};

export const ErrorContentsComponent: React.FC<ErrorContentsProps> = ({ content, useMarkdown }) => {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--error");

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{content.text}</MarkdownComponent>
        </div>
    );
};
