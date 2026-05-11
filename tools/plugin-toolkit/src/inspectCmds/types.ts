// (C) 2021-2026 GoodData Corporation

import { type ActionOptions } from "../_base/types.js";

import { type InspectCmdActionConfig } from "./actionConfig.js";

export type InspectObjectFn = (config: InspectCmdActionConfig, options: ActionOptions) => Promise<void>;
