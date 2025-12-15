// (C) 2024-2025 GoodData Corporation

import cx from "classnames";

import { MarkdownComponent } from "./Markdown.js";
import { type RoutingContents } from "../../../model.js";

export type RoutingContentsProps = {
    content: RoutingContents;
    useMarkdown?: boolean;
    isReasoningEnabled?: boolean;
};

export function RoutingContentsComponent({
    content,
    useMarkdown = true,
    isReasoningEnabled = false,
}: RoutingContentsProps) {
    if (isReasoningEnabled) {
        return (
            <div className="gd-gen-ai-chat__reasoning">
                <div className="gd-gen-ai-chat__reasoning__step">
                    <div className="gd-gen-ai-chat__reasoning__bullet"></div>
                    <div className="gd-gen-ai-chat__reasoning__content">
                        <MarkdownComponent allowMarkdown={useMarkdown}>{content.text}</MarkdownComponent>
                    </div>
                </div>
            </div>
        );
    }

    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--routing");

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{content.text}</MarkdownComponent>
        </div>
    );
}
