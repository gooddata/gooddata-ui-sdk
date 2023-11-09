// (C) 2023 GoodData Corporation
import * as uuid from "uuid";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { prepareDrillLocalIdentifierIfMissing } from "../AnalyticalDashboardConverter.js";
import { dashboardLayout } from "./AnalyticalDashboardConverter.fixture.js";

describe("AnalyticalDashboardConverter", () => {
    describe("prepareDrillLocalIdentifierIfMissing", () => {
        beforeEach(() => {
            vi.spyOn(uuid, "v4").mockReturnValue("mocked-uuid");
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
