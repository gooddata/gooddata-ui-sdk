// (C) 2024 GoodData Corporation

import React from "react";
import { SearchContents } from "../../../model.js";
import cx from "classnames";
import { replaceLinks } from "./replaceLinks.js";
import { MarkdownComponent } from "./Markdown.js";

export type SearchContentsProps = {
    content: SearchContents;
    useMarkdown?: boolean;
};

export const SearchContentsComponent: React.FC<SearchContentsProps> = ({ content, useMarkdown }) => {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--search");
    const text = React.useMemo(() => {
        return replaceLinks(content.text, content.searchResults);
    }, [content.text, content.searchResults]);

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{text}</MarkdownComponent>
        </div>
    );
};
