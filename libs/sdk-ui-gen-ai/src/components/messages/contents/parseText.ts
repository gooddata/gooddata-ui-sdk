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

export type TextNode = {
    type: "text";
    value: string;
};

export const makeTextNode = (value: string): TextNode => ({
    type: "text",
    value,
});

export const isTextNode = (node: Node): node is TextNode => node.type === "text";

export type LinkNode = {
    type: "link";
    value: string;
    href: string;
};

export const makeLinkNode = (value: string, href: string): LinkNode => ({
    type: "link",
    value,
    href,
});

export type Node = TextNode | LinkNode;

const rx = /(\{[^}][^.}]*\.[^}]+\})/;
export const parseText = (text: string, foundObjects: ISemanticSearchResultItem[]): Node[] => {
    return text
        .split(rx)
        .map((chunk) => {
            if (chunk.startsWith("{") && chunk.endsWith("}")) {
                const [objectType, ...objectIdChunks] = chunk.replace("{", "").replace("}", "").split(".");
                const objectId = objectIdChunks.join(".");
                const obj = foundObjects.find(
                    (foundObj) => foundObj.type === objectType && foundObj.id === objectId,
                );

                if (!obj) {
                    return makeTextNode(chunk);
                }

                const href = getFoundObjectLink(obj);

                if (!href) {
                    return makeTextNode(chunk);
                }

                return makeLinkNode(obj.title, href);
            }

            return makeTextNode(chunk);
        })
        .reduce((chunks, chunk) => {
            if (chunk.type === "text" && chunks[chunks.length - 1]?.type === "text") {
                chunks[chunks.length - 1].value += chunk.value;
            } else if (chunk.value !== "") {
                chunks.push(chunk);
            }

            return chunks;
        }, [] as Node[]);
};
