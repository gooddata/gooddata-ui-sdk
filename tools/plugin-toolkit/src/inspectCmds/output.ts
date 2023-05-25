// (C) 2021 GoodData Corporation
/* eslint-disable no-console */
import isEmpty from "lodash/isEmpty.js";

export type ObjectSummary = {
    type: string;
    identifier: string;
    title: string;
    description?: string;
    tags?: string[];
    created: string;
    updated: string;
};

export function printObjectSummary(summary: ObjectSummary): void {
    const { type, title, description, tags, identifier, updated, created } = summary;

    console.log("--");
    console.log(`-- ${type}: ${identifier}`);
    console.log("--");
    console.log(`Title       : ${title}`);
    console.log(`Description : ${!isEmpty(description) ? description : "(none)"}`);
    console.log(`Tags        : ${!isEmpty(tags) ? tags?.join(", ") : "(none)"}`);
    console.log(`Created     : ${created}`);
    console.log(`Updated     : ${updated}`);
}
