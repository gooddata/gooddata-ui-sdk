// (C) 2025-2026 GoodData Corporation

import { type IFilter, isFilterOfAnyType } from "@gooddata/sdk-model";

export function stringToFilters(input: string): IFilter[] {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed) && parsed.every(isFilterOfAnyType)) {
        return parsed;
    } else {
        throw new Error("Invalid filters format");
    }
}
