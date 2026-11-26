// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { NotSupported } from "@gooddata/sdk-backend-spi";
import { idRef, newDashboardParameterizedDateFilter } from "@gooddata/sdk-model";

import { toUpsertDateFilterPayload } from "./tabSyncRules.js";

describe("toUpsertDateFilterPayload", () => {
    it("rejects a period", () => {
        const period = newDashboardParameterizedDateFilter(idRef("fiscal_year", "parameter"));

        expect(() => toUpsertDateFilterPayload(period)).toThrow(NotSupported);
    });
});
