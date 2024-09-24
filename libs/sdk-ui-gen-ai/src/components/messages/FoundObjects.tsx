// (C) 2024 GoodData Corporation

import React from "react";
import { Typography } from "@gooddata/sdk-ui-kit";
import { useWorkspace } from "@gooddata/sdk-ui";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";

type FoundObjectsProps = {
    foundObjects?: ISemanticSearchResultItem[];
};

export const FoundObjects: React.FC<FoundObjectsProps> = ({ foundObjects }) => {
    const first5FoundObjects = foundObjects?.filter((obj) => obj.type === "visualization").slice(0, 5);
    const workspace = useWorkspace();

    if (!first5FoundObjects) {
        return null;
    }

    return (
        <Typography tagName="p">
            I have found the following relevant visualizations:
            <ul>
                {first5FoundObjects.map((vis) => (
                    <li key={vis.id}>
                        <a href={`/analyze/#/${workspace}/${vis.id}/edit`} target="_blank" rel="noreferrer">
                            {vis.title}
                        </a>
                    </li>
                ))}
            </ul>
        </Typography>
    );
};
