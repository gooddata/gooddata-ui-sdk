// (C) 2021-2022 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { TestStash } from "../../../tests/fixtures/Dashboard.fixtures";
import { addLayoutSection, addSectionItem, removeLayoutSection, replaceSectionItem } from "../../../commands";
import { selectLayout } from "../../../store/layout/layoutSelectors";
import { removeSectionItem } from "../../../commands/layout";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWithReferences,
} from "../../../tests/fixtures/ComplexDashboard.fixtures";
import { TestKpiPlaceholderItem } from "../../../tests/fixtures/Layout.fixtures";

describe("stashing", () => {
    let Tester: DashboardTester;
    beforeEach(
        preloadedTesterFactory((tester) => {
            Tester = tester;
        }, ComplexDashboardIdentifier),
    );

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
