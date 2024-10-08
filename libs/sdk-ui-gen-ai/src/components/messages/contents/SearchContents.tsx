// (C) 2024 GoodData Corporation

import React from "react";
import { SearchContents } from "../../../model.js";
import { Hyperlink, Typography } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { isTextNode, parseText } from "./parseText.js";

export type SearchContentsProps = {
    content: SearchContents;
};

export const SearchContentsComponent: React.FC<SearchContentsProps> = ({ content }) => {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--search");
    const nodes = React.useMemo(() => {
        return parseText(content.text, content.searchResults);
    }, [content.text, content.searchResults]);

    return (
        <div className={className}>
            <Typography tagName="p">
                {nodes.map((node, i) => {
                    if (isTextNode(node)) {
                        return <span key={i}>{node.value}</span>;
                    }

                    return <Hyperlink key={i} href={node.href} text={node.value} />;
                })}
            </Typography>
        </div>
    );
};
