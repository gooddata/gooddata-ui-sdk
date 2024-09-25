// (C) 2024 GoodData Corporation

import React from "react";
import { Hyperlink, Typography } from "@gooddata/sdk-ui-kit";
import { GenAIChatFoundObjects } from "@gooddata/sdk-model";

type FoundObjectsProps = {
    foundObjects?: GenAIChatFoundObjects;
};

export const FoundObjects: React.FC<FoundObjectsProps> = ({ foundObjects }) => {
    const first5FoundObjects = React.useMemo(() => {
        return foundObjects?.objects?.filter((obj) => obj.type === "visualization").slice(0, 5);
    }, [foundObjects?.objects]);
    const foundObjectsReasoning = foundObjects?.reasoning;

    if (!first5FoundObjects) {
        return null;
    }

    return (
        <div className="gd-gen-ai-chat__messages__message__found_objects">
            <Typography tagName="p">{foundObjectsReasoning}</Typography>
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
