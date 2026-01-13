// (C) 2024-2026 GoodData Corporation

import cx from "classnames";

import { MarkdownComponent } from "./Markdown.js";
import { type RoutingContents } from "../../../model.js";

export type RoutingContentsProps = {
    content: RoutingContents;
    useMarkdown?: boolean;
    isReasoningEnabled?: boolean;
};

// TODO: Remove this component when reasoning is in GA
export function RoutingContentsComponent({ content, useMarkdown = true }: RoutingContentsProps) {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--routing");

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{content.text}</MarkdownComponent>
        </div>
    );
}
