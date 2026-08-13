// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    getKeyDriverAnalysisSupportedGranularities,
    getKeyDriverAnalysisSupportedStringGranularities,
} from "../const.js";

describe("keyDriverAnalysis supported granularities", () => {
    it("should not include second when feature flag is off", () => {
        expect(getKeyDriverAnalysisSupportedGranularities(false)).not.toContain("GDC.time.second");
        expect(getKeyDriverAnalysisSupportedStringGranularities(false)).not.toContain("SECOND");
    });

    it("should include second when feature flag is on", () => {
        expect(getKeyDriverAnalysisSupportedGranularities(true)).toContain("GDC.time.second");
        expect(getKeyDriverAnalysisSupportedStringGranularities(true)).toContain("SECOND");
    });
});
