// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getDecoratedMeasures } from "./decorated_buckets_service.js";
import { stateWithMasterAndDerivedMeasures } from "./decorated_buckets_service.test.helpers.js";

describe("Decorated Buckets service", () => {
    describe("getDecoratedMeasures", () => {
        it("should return master decorated measures from buckets", () => {
            const measures = getDecoratedMeasures(stateWithMasterAndDerivedMeasures);

            expect(measures).toHaveLength(8);
            expect(measures.every((measure) => measure.original)).toBe(true);
        });
    });
});
