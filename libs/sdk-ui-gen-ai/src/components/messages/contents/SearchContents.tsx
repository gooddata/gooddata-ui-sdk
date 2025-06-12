// (C) 2024-2025 GoodData Corporation

import React from "react";
import { SearchContents } from "../../../model.js";
import cx from "classnames";
import { replaceLinks } from "./replaceLinks.js";
import { MarkdownComponent } from "./Markdown.js";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";

export type SearchContentsProps = {
    content: SearchContents;
    useMarkdown?: boolean;
};

export const SearchContentsComponent: React.FC<SearchContentsProps> = ({ content, useMarkdown }) => {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--search");
    const workspace = useWorkspaceStrict();
    const text = React.useMemo(() => {
        return replaceLinks(content.text, content.searchResults, workspace);
    }, [content.text, content.searchResults, workspace]);

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{text}</MarkdownComponent>
        </div>
    );
};
