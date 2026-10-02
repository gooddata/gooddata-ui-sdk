// (C) 2026 GoodData Corporation

import { type IConfiguratorContext } from "./configuratorContext.js";
import { makeCtx as makeHighchartsOptionsCtx } from "./highchartsOptions.test.utils.js";

export function makeCtx(overrides: Partial<IConfiguratorContext> = {}): IConfiguratorContext {
    return {
        ...makeHighchartsOptionsCtx(),
        highchartsOptions: {},
        ...overrides,
    };
}
