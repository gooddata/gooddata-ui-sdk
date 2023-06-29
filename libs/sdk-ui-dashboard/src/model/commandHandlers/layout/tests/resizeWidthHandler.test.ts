// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { resizeWidth, ResizeWidth } from "../../../commands/layout.js";
import { DashboardCommandFailed } from "../../../events/index.js";
import { selectLayout } from "../../../store/layout/layoutSelectors.js";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";

import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { DashboardLayoutSectionItemWidthResized } from "../../../events/layout.js";

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
            const fail: DashboardCommandFailed<ResizeWidth> = await Tester.dispatchAndWaitFor(
                resizeWidth(originalLayout.sections.length, 1, 10, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad item index is provided", async () => {
            const originalLayout = selectLayout(Tester.state());

            const fail: DashboardCommandFailed<ResizeWidth> = await Tester.dispatchAndWaitFor(
                resizeWidth(0, originalLayout.sections[0].items.length, 10, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });
    });

    describe("for valid indexes", () => {
        it("should set width in items by index", async () => {
            const originalLayout = selectLayout(Tester.state());

            const event: DashboardLayoutSectionItemWidthResized = await Tester.dispatchAndWaitFor(
                resizeWidth(1, 0, 10),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ITEM_WIDTH_RESIZED",
            );

            const newLayout = selectLayout(Tester.state());
            expect(newLayout.sections[1].items[0].size.xl.gridWidth).toEqual(10);

            expect(newLayout.sections[1].items[1].size.xl.gridWidth).toEqual(
                originalLayout.sections[1].items[1].size.xl.gridWidth,
            );
            expect(newLayout.sections[1].items[2].size.xl.gridWidth).toEqual(
                originalLayout.sections[1].items[2].size.xl.gridWidth,
            );

            expect(event).toMatchObject({
                type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ITEM_WIDTH_RESIZED",
                payload: {
                    sectionIndex: 1,
                    itemIndex: 0,
                    newWidth: 10,
                },
            });
        });

        it("should throw error for invalid width is to small", async () => {
            const fail: DashboardCommandFailed<ResizeWidth> = await Tester.dispatchAndWaitFor(
                resizeWidth(1, 0, 1, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });

        it("should throw error for invalid width is to big", async () => {
            const fail: DashboardCommandFailed<ResizeWidth> = await Tester.dispatchAndWaitFor(
                resizeWidth(1, 0, 15, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });
    });
});
