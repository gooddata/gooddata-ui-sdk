// (C) 2024-2025 GoodData Corporation

import { useMemo } from "react";

import cx from "classnames";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import { MarkdownComponent } from "./Markdown.js";
import { replaceLinks } from "./replaceLinks.js";
import { SearchContents } from "../../../model.js";

export type SearchContentsProps = {
    content: SearchContents;
    useMarkdown?: boolean;
};

export function SearchContentsComponent({ content, useMarkdown }: SearchContentsProps) {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--search");
    const workspace = useWorkspaceStrict();
    const text = useMemo(() => {
        return replaceLinks(content.text, content.searchResults, workspace);
    }, [content.text, content.searchResults, workspace]);

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{text}</MarkdownComponent>
        </div>
    );
}
