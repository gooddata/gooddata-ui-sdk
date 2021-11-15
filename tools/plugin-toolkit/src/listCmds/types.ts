// (C) 2021 GoodData Corporation

import { ListCmdActionConfig } from "./actionConfig";
import { ActionOptions } from "../_base/types";

export type ListEntry = {
    identifier: string;
    title?: string;
    description?: string;
    created: string;
    updated: string;
    tags: string[];
};

export type ListObjectsFn = (config: ListCmdActionConfig, options: ActionOptions) => Promise<ListEntry[]>;
