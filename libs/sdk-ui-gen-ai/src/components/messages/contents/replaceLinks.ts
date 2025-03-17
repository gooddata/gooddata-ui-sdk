// (C) 2024-2025 GoodData Corporation

import { ISemanticSearchResultItem } from "@gooddata/sdk-model";

/**
 * Use custom URL schema for the link. In Markdown rendered our component knows
 * how to handle these and how to convert them to normal links.
 *
 * Custom URL schema is `gooddata://<type>?ws=<workspaceId>&id=<objectId>`
 */
const getFoundObjectLink = (obj: ISemanticSearchResultItem, workspaceId: string) => {
    switch (obj.type) {
        case "visualization":
            return `gooddata://visualization?ws=${workspaceId}&id=${obj.id}`;
        case "dashboard":
            return `gooddata://dashboard?ws=${workspaceId}&id=${obj.id}`;
        case "metric":
            return `gooddata://metric?ws=${workspaceId}&id=${obj.id}`;
        default:
            return null;
    }
};

/**
 * TODO - consider using inline directives syntax for object references,
 *  or teach LLM to return custom schema URLs from the get-go.
 */
const rx = /\{[^}][^.}]*\.[^}]+\}/g;
export const replaceLinks = (
    text: string,
    foundObjects: ISemanticSearchResultItem[],
    workspaceId: string,
): string => {
    return text.replace(rx, (chunk) => {
        const [objectType, ...objectIdChunks] = chunk.replace("{", "").replace("}", "").split(".");
        const objectId = objectIdChunks.join(".");

        const obj = foundObjects.find((foundObj) => foundObj.type === objectType && foundObj.id === objectId);

        if (!obj) {
            return chunk;
        }

        const href = getFoundObjectLink(obj, workspaceId);

        if (!href) {
            return chunk;
        }

        return `[${obj.title}](${href})`;
    });
};
