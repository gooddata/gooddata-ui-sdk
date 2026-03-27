// (C) 2024-2026 GoodData Corporation

import { type AfmObjectIdentifier } from "@gooddata/api-client-tiger";

import { SupportedReferenceTypes } from "./typeGuards.js";
import { createIdentifier, getIdentifier } from "./yamlUtils.js";

const referenceRegex = new RegExp(
    `\\{((?:${SupportedReferenceTypes.join("|")})\\/(?!\\.)[.A-Za-z0-9_-]{1,255})\\}`,
);
const referenceBuilder = (item: AfmObjectIdentifier) => `{${getIdentifier(item)}}`;

export function serializeUrlTarget(data: Array<string | AfmObjectIdentifier>): string {
    return data
        .map((item) => {
            if (typeof item === "string") {
                return item;
            }
            return referenceBuilder(item);
        })
        .join("");
}

export function parseUrlTarget(data: string): Array<string | AfmObjectIdentifier> {
    const parsed = data.split(referenceRegex);
    const result: Array<string | AfmObjectIdentifier> = [];

    for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (i % 2 === 0) {
            result.push(item);
        } else {
            const identifier = createIdentifier(item);
            identifier && result.push(identifier);
        }
    }

    return result;
}
