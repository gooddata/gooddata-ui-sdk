// (C) 2021-2026 GoodData Corporation

import { type ActionOptions } from "../_base/types.js";

import { type ListCmdActionConfig } from "./actionConfig.js";

export type ListEntry = {
    identifier: string;
    title?: string;
    description?: string;
    created: string;
    updated: string;
    tags: string[];
};

export type ListObjectsFn = (config: ListCmdActionConfig, options: ActionOptions) => Promise<ListEntry[]>;
