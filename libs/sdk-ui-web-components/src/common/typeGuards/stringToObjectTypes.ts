// (C) 2025 GoodData Corporation

import { GenAIObjectType } from "@gooddata/sdk-model";

export function stringToObjectTypes(input: string): GenAIObjectType[] {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string")) {
        return parsed as GenAIObjectType[];
    } else {
        throw new Error("Invalid filters format");
    }
}
