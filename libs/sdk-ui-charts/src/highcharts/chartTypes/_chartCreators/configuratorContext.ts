// (C) 2026 GoodData Corporation

import { type HighchartsOptions } from "../../lib/index.js";

import { type IHighchartsOptionsContext } from "./highchartsOptionsContext.js";

export interface IConfiguratorContext extends IHighchartsOptionsContext {
    highchartsOptions: HighchartsOptions;
}
