// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestStash } from "../../../tests/fixtures/Dashboard.fixtures.js";
import {
    addLayoutSection,
    addSectionItem,
    removeLayoutSection,
    replaceSectionItem,
} from "../../../commands/index.js";
import { selectLayout } from "../../../store/layout/layoutSelectors.js";
import { removeSectionItem } from "../../../commands/layout.js";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWithReferences,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";
import { TestKpiPlaceholderItem } from "../../../tests/fixtures/Layout.fixtures.js";

describe("stashing", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, ComplexDashboardIdentifier);
    });

    const [ThirdSectionFirstItem] = ComplexDashboardWithReferences.dashboard.layout!.sections[2].items;
    const [SecondSectionFirstItem, SecondSectionSecondItem] =
        ComplexDashboardWithReferences.dashboard.layout!.sections[1].items;

    it("should correctly use stash when remove section and add section combination", async () => {
        const originalItems = selectLayout(Tester.state()).sections[0].items;
        // remove first section with 6 KPIs
        await Tester.dispatchAndWaitFor(
            removeLayoutSection(0, TestStash),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED",
        );

        await Tester.dispatchAndWaitFor(
            addLayoutSection(-1, { title: "My New Section" }, [TestStash]),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        );

        const layout = selectLayout(Tester.state());
        expect(layout.sections[2].items).toEqual(originalItems);
    });

    it("should correctly use stash when remove section and add section items", async () => {
        const originalItems = selectLayout(Tester.state()).sections[0].items;

        // remove first section with 6 KPIs
        await Tester.dispatchAndWaitFor(
            removeLayoutSection(0, TestStash),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED",
        );

        await Tester.dispatchAndWaitFor(
            addSectionItem(1, -1, TestStash),
            "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        );

        const layout = selectLayout(Tester.state());
        // items from removed section should land at the end of the section
        expect(layout.sections[1].items).toEqual([expect.any(Object), ...originalItems]);
    });

    it("should correctly use stash when remove item and add section", async () => {
        await Tester.dispatchAndWaitFor(
            removeSectionItem(2, 0, TestStash),
            "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
        );

        await Tester.dispatchAndWaitFor(
            addLayoutSection(-1, { title: "My New Section" }, [TestStash]),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        );

        const layout = selectLayout(Tester.state());
        expect(layout.sections[3].items).toEqual([ThirdSectionFirstItem]);
    });

    it("should correctly use stash when remove item and add item", async () => {
        await Tester.dispatchAndWaitFor(
            removeSectionItem(2, 0, TestStash),
            "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
        );

        await Tester.dispatchAndWaitFor(
            addSectionItem(1, -1, TestStash),
            "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        );

        const layout = selectLayout(Tester.state());
        expect(layout.sections[1].items).toEqual([
            SecondSectionFirstItem,
            SecondSectionSecondItem,
            ThirdSectionFirstItem,
        ]);
    });

    it("should correctly use stash when replace item and add section", async () => {
        await Tester.dispatchAndWaitFor(
            replaceSectionItem(2, 0, TestKpiPlaceholderItem, TestStash),
            "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
        );

        await Tester.dispatchAndWaitFor(
            addLayoutSection(-1, { title: "My New Section" }, [TestStash]),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        );

        const layout = selectLayout(Tester.state());
        expect(layout.sections[3].items).toEqual([ThirdSectionFirstItem]);
    });

    it("should correctly use stash when replace item and add item", async () => {
        await Tester.dispatchAndWaitFor(
            replaceSectionItem(2, 0, TestKpiPlaceholderItem, TestStash),
            "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
        );

        await Tester.dispatchAndWaitFor(
            addSectionItem(1, -1, TestStash),
            "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        );

        const layout = selectLayout(Tester.state());
        expect(layout.sections[1].items).toEqual([
            SecondSectionFirstItem,
            SecondSectionSecondItem,
            ThirdSectionFirstItem,
        ]);
    });
});
