// (C) 2025 GoodData Corporation

import { IFilter, isFilter } from "@gooddata/sdk-model";

export function stringToFilters(input: string): IFilter[] {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed) && parsed.every(isFilter)) {
        return parsed;
    } else {
        throw new Error("Invalid filters format");
    }
}
