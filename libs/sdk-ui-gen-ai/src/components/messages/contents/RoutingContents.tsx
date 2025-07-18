// (C) 2024-2025 GoodData Corporation

import cx from "classnames";
import { RoutingContents } from "../../../model.js";
import { MarkdownComponent } from "./Markdown.js";

export type RoutingContentsProps = {
    content: RoutingContents;
    useMarkdown?: boolean;
};

export function RoutingContentsComponent({ content, useMarkdown }: RoutingContentsProps) {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--routing");

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{content.text}</MarkdownComponent>
        </div>
    );
}
