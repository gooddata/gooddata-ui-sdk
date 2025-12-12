// (C) 2021 GoodData Corporation

import { type ListCmdActionConfig } from "./actionConfig.js";
import { type ActionOptions } from "../_base/types.js";

export type ListEntry = {
    identifier: string;
    title?: string;
    description?: string;
    created: string;
    updated: string;
    tags: string[];
};

export type ListObjectsFn = (config: ListCmdActionConfig, options: ActionOptions) => Promise<ListEntry[]>;
