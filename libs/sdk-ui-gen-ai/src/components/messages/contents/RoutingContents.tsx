// (C) 2024 GoodData Corporation

import React from "react";
import cx from "classnames";
import { RoutingContents } from "../../../model.js";
import { MarkdownComponent } from "./Markdown.js";

export type RoutingContentsProps = {
    content: RoutingContents;
    useMarkdown?: boolean;
};

export const RoutingContentsComponent: React.FC<RoutingContentsProps> = ({ content, useMarkdown }) => {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--routing");

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{content.text}</MarkdownComponent>
        </div>
    );
};
