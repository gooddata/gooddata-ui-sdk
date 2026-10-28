// (C) 2026 GoodData Corporation

import { describe, expectTypeOf, it } from "vitest";

import { type AdInsightSavedBody, type GdcAdEventType, type GdcEventType } from "@gooddata/sdk-embedding";

import { type AnalyticalDesignerEvent, type AnalyticalDesignerEventType } from "./analyticalDesignerTypes.js";

describe("AnalyticalDesignerEventType", () => {
    it("uses the @gooddata/sdk-embedding names, except the events only Analytical Designer emits", () => {
        expectTypeOf<
            Exclude<AnalyticalDesignerEventType, `${GdcAdEventType}` | `${GdcEventType}`>
        >().toEqualTypeOf<"availableCommands" | "metricsChanged">();
    });
});

describe("AnalyticalDesignerEvent", () => {
    it("narrows the payload by the event type", () => {
        expectTypeOf<
            Extract<AnalyticalDesignerEvent, { type: "visualizationSaved" }>["data"]
        >().toEqualTypeOf<AdInsightSavedBody>();
        expectTypeOf<
            Extract<AnalyticalDesignerEvent, { type: "insightEditingCancelled" }>["data"]
        >().toEqualTypeOf<null>();
    });
});
