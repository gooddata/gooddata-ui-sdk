// (C) 2021 GoodData Corporation

import { InspectCmdActionConfig } from "./actionConfig.js";
import { ActionOptions } from "../_base/types.js";

export type InspectObjectFn = (config: InspectCmdActionConfig, options: ActionOptions) => Promise<void>;
