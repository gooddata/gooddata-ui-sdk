// (C) 2024 GoodData Corporation

import React from "react";
import { Hyperlink, Typography } from "@gooddata/sdk-ui-kit";
import { GenAIChatFoundObjects, ISemanticSearchResultItem } from "@gooddata/sdk-model";

type FoundObjectsProps = {
    foundObjects?: GenAIChatFoundObjects;
};

const SUPPORTED_OBJECT_TYPES = ["visualization", "dashboard"];

export const FoundObjects: React.FC<FoundObjectsProps> = ({ foundObjects }) => {
    const first5FoundObjects = React.useMemo(() => {
        return foundObjects?.objects?.filter((obj) => SUPPORTED_OBJECT_TYPES.includes(obj.type)).slice(0, 5);
    }, [foundObjects?.objects]);
    const foundObjectsReasoning = foundObjects?.reasoning;

    if (!first5FoundObjects) {
        return null;
    }

    return (
        <div className="gd-gen-ai-chat__messages__message__found_objects">
            <Typography tagName="p">{foundObjectsReasoning}</Typography>
            <ul>
                {first5FoundObjects.map((obj) => (
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
