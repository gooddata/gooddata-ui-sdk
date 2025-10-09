// (C) 2021-2025 GoodData Corporation

/* eslint-disable no-console */
import { isEmpty } from "lodash-es";

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
    console.log(`Description : ${isEmpty(description) ? "(none)" : description}`);
    console.log(`Tags        : ${isEmpty(tags) ? "(none)" : tags?.join(", ")}`);
    console.log(`Created     : ${created}`);
    console.log(`Updated     : ${updated}`);
}
