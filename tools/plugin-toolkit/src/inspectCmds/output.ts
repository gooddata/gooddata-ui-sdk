// (C) 2021-2026 GoodData Corporation

// oxlint-disable eslint-js/no-console

import { _isEmpty } from "@gooddata/util";

export type ObjectSummary = {
    type: string;
    identifier: string;
    title: string;
    description?: string;
    tags?: string[];
    created: string;
    updated: string;
};

export function printObjectSummary({
    type,
    title,
    description,
    tags,
    identifier,
    updated,
    created,
}: ObjectSummary): void {
    console.log("--");
    console.log(`-- ${type}: ${identifier}`);
    console.log("--");
    console.log(`Title       : ${title}`);
    console.log(`Description : ${_isEmpty(description) ? "(none)" : description}`);
    console.log(`Tags        : ${_isEmpty(tags) ? "(none)" : tags?.join(", ")}`);
    console.log(`Created     : ${created}`);
    console.log(`Updated     : ${updated}`);
}
