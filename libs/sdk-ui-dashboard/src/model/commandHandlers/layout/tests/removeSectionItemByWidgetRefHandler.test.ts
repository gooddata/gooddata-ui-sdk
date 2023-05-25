// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { idRef, ObjRef } from "@gooddata/sdk-model";
import { RemoveSectionItemByWidgetRef } from "../../../../../esm/model/commands/layout.js";
import {
    removeSectionItemByWidgetRef,
    undoLayoutChanges,
    eagerRemoveSectionItemByWidgetRef,
} from "../../../commands/layout.js";
import {
    DashboardCommandFailed,
    DashboardLayoutChanged,
    DashboardLayoutSectionItemRemoved,
    DashboardLayoutSectionRemoved,
} from "../../../events/index.js";
import { selectLayout } from "../../../store/layout/layoutSelectors.js";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardLayout,
    ComplexDashboardWithReferences,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("remove layout section item handler", () => {
    describe("for any dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier);
        });

        it("should fail if bad ref specified", async () => {
            const fail: DashboardCommandFailed<RemoveSectionItemByWidgetRef> =
                await Tester.dispatchAndWaitFor(
                    removeSectionItemByWidgetRef(idRef("someRef"), undefined, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });
    });

    describe("for dashboard with existing sections", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, ComplexDashboardIdentifier);
        });

        const [SecondSectionFirstItem, SecondSectionSecondItem] =
            ComplexDashboardWithReferences.dashboard.layout!.sections[1].items;

        const [ThirdSectionFirstItem] = ComplexDashboardWithReferences.dashboard.layout!.sections[2].items;

        const SecondSectionFirstItemRef = (SecondSectionFirstItem.widget as any).ref as ObjRef;
        const ThirdSectionFirstItemRef = (ThirdSectionFirstItem.widget as any).ref as ObjRef;

        it("should remove item by ref", async () => {
            const event: DashboardLayoutSectionItemRemoved = await Tester.dispatchAndWaitFor(
                removeSectionItemByWidgetRef(SecondSectionFirstItemRef, undefined),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
            );

            expect(event.payload.item).toEqual(SecondSectionFirstItem);
            const section = selectLayout(Tester.state()).sections[1];
            expect(section.items).toEqual([SecondSectionSecondItem]);
        });

        it("should remove item from a section and leave the section empty", async () => {
            const event: DashboardLayoutSectionItemRemoved = await Tester.dispatchAndWaitFor(
                removeSectionItemByWidgetRef(ThirdSectionFirstItemRef),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
            );

            expect(event.payload.item).toEqual(ThirdSectionFirstItem);
            const section = selectLayout(Tester.state()).sections[2];
            expect(section.items).toEqual([]);
        });

        it("should eagerly remove last remaining item from a section and remove section", async () => {
            const event: DashboardLayoutSectionItemRemoved = await Tester.dispatchAndWaitFor(
                eagerRemoveSectionItemByWidgetRef(ThirdSectionFirstItemRef),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
            );

            const sectionRemovedEvent: DashboardLayoutSectionRemoved = await Tester.waitFor(
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED",
            );

            expect(sectionRemovedEvent.payload.section?.items).toEqual([]);
            expect(event.payload.item).toEqual(ThirdSectionFirstItem);
            expect(event.payload.section?.items).toEqual([]);
            const layout = selectLayout(Tester.state());
            expect(layout.sections).toEqual(ComplexDashboardLayout.sections.slice(0, 2));
        });

        it("should be undoable", async () => {
            Tester.dispatch(
                removeSectionItemByWidgetRef(ThirdSectionFirstItemRef, undefined, TestCorrelation),
            );

            const removalUndone: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );

            expect(removalUndone.payload.layout.sections[2]).toBeDefined();
            expect(removalUndone.payload.layout.sections[2].items).toEqual([ThirdSectionFirstItem]);
        });
    });
});
