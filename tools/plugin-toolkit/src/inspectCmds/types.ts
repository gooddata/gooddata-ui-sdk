// (C) 2021 GoodData Corporation

import { InspectCmdActionConfig } from "./actionConfig";
import { ActionOptions } from "../_base/types";

export type InspectObjectFn = (config: InspectCmdActionConfig, options: ActionOptions) => Promise<void>;
