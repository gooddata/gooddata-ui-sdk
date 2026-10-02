// (C) 2026 GoodData Corporation

import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { type IDrillConfig, createIntlMock } from "@gooddata/sdk-ui";

import { type IHighchartsOptionsContext } from "./highchartsOptionsContext.js";

export function makeCtx(overrides: Partial<IHighchartsOptionsContext> = {}): IHighchartsOptionsContext {
    return {
        chartConfig: {},
        chartOptions: {},
        drillConfig: makeDrillConfig(),
        intl: createIntlMock(),
        ...overrides,
    };
}

export function makeDrillConfig(overrides: Partial<IDrillConfig> = {}): IDrillConfig {
    return {
        dataView: dummyDataView({
            attributes: [],
            buckets: [],
            dimensions: [],
            filters: [],
            measures: [],
            sortBy: [],
            workspace: "",
        }),
        onDrill: () => {},
        ...overrides,
    };
}
