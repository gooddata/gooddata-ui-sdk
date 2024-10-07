// (C) 2024 GoodData Corporation

import React from "react";
import { SearchContents } from "../../../model.js";
import { Hyperlink, Typography } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";

export type SearchContentsProps = {
    content: SearchContents;
};

export const SearchContentsComponent: React.FC<SearchContentsProps> = ({ content }) => {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--search");

    return (
        <div className={className}>
            <Typography tagName="p">{content.text}</Typography>
            <ul>
                {content.searchResults?.map((obj) => (
                    <li key={obj.id}>
                        <Hyperlink href={getFoundObjectLink(obj)} text={obj.title} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const getFoundObjectLink = (obj: ISemanticSearchResultItem) => {
    switch (obj.type) {
        case "visualization":
            return `/analyze/#/${obj.workspaceId}/${obj.id}/edit`;
        case "dashboard":
            return `/dashboards/#/workspace/${obj.workspaceId}/dashboard/${obj.id}`;
        default:
            throw new Error(`Unsupported object type ${obj.type}`);
    }
};
