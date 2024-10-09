// (C) 2024 GoodData Corporation

import { ISemanticSearchResultItem } from "@gooddata/sdk-model";

const getFoundObjectLink = (obj: ISemanticSearchResultItem) => {
    switch (obj.type) {
        case "visualization":
            return `/analyze/#/${obj.workspaceId}/${obj.id}/edit`;
        case "dashboard":
            return `/dashboards/#/workspace/${obj.workspaceId}/dashboard/${obj.id}`;
        case "metric":
            return `/metrics/#/${obj.workspaceId}/metric/${obj.id}`;
        default:
            return null;
    }
};

const rx = /\{[^}][^.}]*\.[^}]+\}/g;
export const replaceLinks = (text: string, foundObjects: ISemanticSearchResultItem[]): string => {
    return text.replace(rx, (chunk) => {
        const [objectType, ...objectIdChunks] = chunk.replace("{", "").replace("}", "").split(".");
        const objectId = objectIdChunks.join(".");

        const obj = foundObjects.find((foundObj) => foundObj.type === objectType && foundObj.id === objectId);

        if (!obj) {
            return chunk;
        }

        const href = getFoundObjectLink(obj);

        if (!href) {
            return chunk;
        }

        return `[${obj.title}](${href})`;
    });
};
