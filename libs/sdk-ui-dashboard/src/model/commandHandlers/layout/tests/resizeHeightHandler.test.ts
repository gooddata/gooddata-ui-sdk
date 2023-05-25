// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { resizeHeight, ResizeHeight } from "../../../commands/layout.js";
import { DashboardCommandFailed } from "../../../events/index.js";
import { selectLayout } from "../../../store/layout/layoutSelectors.js";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";

import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { DashboardLayoutSectionItemsHeightResized } from "../../../events/layout.js";

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
        it("should set height in items by index", async () => {
            const originalLayout = selectLayout(Tester.state());

            const event: DashboardLayoutSectionItemsHeightResized = await Tester.dispatchAndWaitFor(
                resizeHeight(1, [0, 1], 14),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ITEMS_HEIGHT_RESIZED",
            );

            const newLayout = selectLayout(Tester.state());
            expect(newLayout.sections[1].items[0].size.xl.gridHeight).toEqual(14);
            expect(newLayout.sections[1].items[1].size.xl.gridHeight).toEqual(14);
            expect(newLayout.sections[1].items[2].size.xl.gridHeight).toEqual(
                originalLayout.sections[1].items[2].size.xl.gridHeight,
            );

            expect(event).toMatchObject({
                type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ITEMS_HEIGHT_RESIZED",
                payload: {
                    sectionIndex: 1,
                    itemIndexes: [0, 1],
                    newHeight: 14,
                },
            });
        });

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
