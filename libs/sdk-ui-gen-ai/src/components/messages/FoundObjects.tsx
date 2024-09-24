// (C) 2024 GoodData Corporation

import React from "react";
import { Hyperlink, Typography } from "@gooddata/sdk-ui-kit";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";

type FoundObjectsProps = {
    foundObjects?: ISemanticSearchResultItem[];
};

export const FoundObjects: React.FC<FoundObjectsProps> = ({ foundObjects }) => {
    const first5FoundObjects = foundObjects?.filter((obj) => obj.type === "visualization").slice(0, 5);

    if (!first5FoundObjects) {
        return null;
    }

    return (
        <div className="gd-gen-ai-chat__messages__message__found_objects">
            <Typography tagName="p">I have found the following relevant visualizations:</Typography>
            <ul>
                {first5FoundObjects.map((vis) => (
                    <li key={vis.id}>
                        <Hyperlink href={`/analyze/#/${vis.workspaceId}/${vis.id}/edit`} text={vis.title} />
                    </li>
                ))}
            </ul>
        </div>
    );
};
