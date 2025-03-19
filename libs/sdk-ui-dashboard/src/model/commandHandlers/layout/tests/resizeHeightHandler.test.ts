// (C) 2021-2024 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { resizeHeight, ResizeHeight } from "../../../commands/layout.js";
import { DashboardCommandFailed } from "../../../events/index.js";
import { selectLayout } from "../../../store/layout/layoutSelectors.js";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";

import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("resize section items height handler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    describe("with invalid indexes", () => {
        it("should fail if bad section index is provided", async () => {
            const originalLayout = selectLayout(Tester.state());
            const fail: DashboardCommandFailed<ResizeHeight> = await Tester.dispatchAndWaitFor(
                resizeHeight(originalLayout.sections.length, [], 10, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad item index is provided", async () => {
            const originalLayout = selectLayout(Tester.state());

            const fail: DashboardCommandFailed<ResizeHeight> = await Tester.dispatchAndWaitFor(
                resizeHeight(0, [originalLayout.sections[0].items.length], 10, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });
    });

    describe("for valid indexes", () => {
        it("should throw error for invalid height", async () => {
            const fail: DashboardCommandFailed<ResizeHeight> = await Tester.dispatchAndWaitFor(
                resizeHeight(1, [0, 1], 1, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });
    });
});
