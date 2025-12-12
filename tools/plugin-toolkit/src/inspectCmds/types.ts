// (C) 2021 GoodData Corporation

import { type InspectCmdActionConfig } from "./actionConfig.js";
import { type ActionOptions } from "../_base/types.js";

export type InspectObjectFn = (config: InspectCmdActionConfig, options: ActionOptions) => Promise<void>;
