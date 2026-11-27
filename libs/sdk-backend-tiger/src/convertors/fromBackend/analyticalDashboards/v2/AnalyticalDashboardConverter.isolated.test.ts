// (C) 2023-2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type prepareDrillLocalIdentifierIfMissing as PrepareDrillLocalIdentifierIfMissing } from "./AnalyticalDashboardConverter.js";
import { dashboardLayout } from "./AnalyticalDashboardConverter.test.helpers.js";

vi.mock("uuid", () => ({
    v4: vi.fn(() => "mocked-uuid"),
}));

// The converter is imported dynamically from a fresh module registry so that it picks up the "uuid"
// mock above even when another (non-isolated) test file already imported it with the real "uuid".
let prepareDrillLocalIdentifierIfMissing: typeof PrepareDrillLocalIdentifierIfMissing;

describe("AnalyticalDashboardConverter", () => {
    beforeAll(async () => {
        vi.resetModules();
        ({ prepareDrillLocalIdentifierIfMissing } = await import("./AnalyticalDashboardConverter.js"));
    });

    describe("prepareDrillLocalIdentifierIfMissing", () => {
        beforeEach(() => {
            vi.mocked(uuidv4).mockReturnValue("mocked-uuid" as unknown as Uint8Array<ArrayBufferLike>);
        });

        afterEach(() => {
            vi.clearAllMocks();
        });

        it("should return undefined if layout is undefined", () => {
            expect(prepareDrillLocalIdentifierIfMissing(undefined)).toBeUndefined();
        });

        it("should add localIdentifier to drillItems if missing", () => {
            expect(prepareDrillLocalIdentifierIfMissing(dashboardLayout)).toMatchSnapshot();
        });
    });
});
