// (C) 2023-2025 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { prepareDrillLocalIdentifierIfMissing } from "../AnalyticalDashboardConverter.js";
import { dashboardLayout } from "./AnalyticalDashboardConverter.fixture.js";

vi.mock("uuid", () => ({
    v4: vi.fn(() => "mocked-uuid"),
}));

describe("AnalyticalDashboardConverter", () => {
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
