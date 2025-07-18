// (C) 2023-2025 GoodData Corporation
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("uuid", () => ({
    v4: vi.fn(() => "mocked-uuid"),
}));

import { v4 } from "uuid";

import { prepareDrillLocalIdentifierIfMissing } from "../AnalyticalDashboardConverter.js";
import { dashboardLayout } from "./AnalyticalDashboardConverter.fixture.js";

describe("AnalyticalDashboardConverter", () => {
    describe("prepareDrillLocalIdentifierIfMissing", () => {
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
