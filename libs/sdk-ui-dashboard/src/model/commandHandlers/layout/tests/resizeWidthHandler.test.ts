// (C) 2021-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { type IResizeWidth, resizeWidth } from "../../../commands/layout.js";
import { type IDashboardCommandFailed } from "../../../events/general.js";
import { selectLayout } from "../../../store/tabs/layout/layoutSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("resize section items width handler", () => {
    let Tester: DashboardTester;
    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    describe("with invalid indexes", () => {
        it("should fail if bad section index is provided", async () => {
            const originalLayout = selectLayout(Tester.state());
            const fail: IDashboardCommandFailed<IResizeWidth> = await Tester.dispatchAndWaitFor(
                resizeWidth(originalLayout.sections.length, 1, 10, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad item index is provided", async () => {
            const originalLayout = selectLayout(Tester.state());

            const fail: IDashboardCommandFailed<IResizeWidth> = await Tester.dispatchAndWaitFor(
                resizeWidth(0, originalLayout.sections[0].items.length, 10, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });
    });

    describe("for valid indexes", () => {
        it("should throw error for invalid width is to small", async () => {
            const fail: IDashboardCommandFailed<IResizeWidth> = await Tester.dispatchAndWaitFor(
                resizeWidth(1, 0, 1, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });

        it("should throw error for invalid width is to big", async () => {
            const fail: IDashboardCommandFailed<IResizeWidth> = await Tester.dispatchAndWaitFor(
                resizeWidth(1, 0, 15, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });
    });
});
