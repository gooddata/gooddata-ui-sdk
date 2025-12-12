// (C) 2022-2025 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    type IInsightWidgetDefinition,
    newAbsoluteDateFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

import {
    addAttributeFilter,
    addLayoutSection,
    addSectionItem,
    applyAttributeFilter,
    applyDateFilter,
    changeInsightWidgetHeader,
    changeInsightWidgetVisProperties,
    changeLayoutSectionHeader,
    moveAttributeFilter,
    moveLayoutSection,
    moveSectionItem,
    removeAttributeFilter,
    removeDrillsForInsightWidget,
    removeLayoutSection,
    removeSectionItem,
    renameDashboard,
    replaceSectionItem,
    unignoreFilterOnInsightWidget,
} from "../../../commands/index.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import {
    ComplexDashboardFilters,
    ComplexDashboardIdentifier,
    ComplexDashboardWidgets,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";
import { TestCorrelation, TestStash } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { type ExtendedDashboardItem } from "../../../types/layoutTypes.js";
import { selectIsDashboardDirty } from "../metaSelectors.js";

describe("selectIsDashboardDirty", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, ComplexDashboardIdentifier);
    });

    it("should return false for dashboard just opened", () => {
        expect(Tester.select(selectIsDashboardDirty)).toBe(false);
    });

    // we have to use insight widget as custom widgets are currently ignored by the dirty selector: they cannot be saved to the backend anyway
    const insightWidget: ExtendedDashboardItem<IInsightWidgetDefinition> = {
        size: { xl: { gridWidth: 12 } },
        type: "IDashboardLayoutItem",
        widget: {
            ...ComplexDashboardWidgets.SecondSection.FirstTable,
        },
    };

    type Scenario = [name: string, command: any, event: string];
    const scenarios: Scenario[] = [
        // meta manipulations
        ["title change", renameDashboard("New title", TestCorrelation), "GDC.DASH/EVT.RENAMED"],
        // section manipulations
        [
            "section header change",
            changeLayoutSectionHeader(0, { title: "New Title" }, false, TestCorrelation),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED",
        ],
        [
            "section removal",
            removeLayoutSection(0, TestStash, TestCorrelation),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED",
        ],
        ["section move", moveLayoutSection(0, 1, TestCorrelation), "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED"],
        [
            "section addition",
            addLayoutSection(0, undefined, [insightWidget], false, TestCorrelation),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        ],
        // widget manipulations
        ["widget move", moveSectionItem(0, 0, 1, 1, TestCorrelation), "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED"],
        [
            "widget removal",
            removeSectionItem(0, 0, TestCorrelation),
            "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
        ],
        [
            "widget addition",
            addSectionItem(0, 0, insightWidget, false, TestCorrelation),
            "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        ],
        [
            "widget replacement",
            replaceSectionItem(0, 0, insightWidget, TestCorrelation),
            "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
        ],
        // insight manipulations
        [
            "insight rename",
            changeInsightWidgetHeader(
                ComplexDashboardWidgets.SecondSection.FirstTable.ref,
                { title: "New title" },
                TestCorrelation,
            ),
            "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED",
        ],
        [
            "insight filter change",
            unignoreFilterOnInsightWidget(
                ComplexDashboardWidgets.SecondSection.FirstTable.ref,
                ComplexDashboardFilters.FirstAttribute.idRef,
                TestCorrelation,
            ),
            "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        ],
        [
            "insight properties change",
            changeInsightWidgetVisProperties(
                ComplexDashboardWidgets.SecondSection.FirstTable.ref,
                { controls: { someProperty: 42 } },
                TestCorrelation,
            ),
            "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
        ],
        [
            "insight drills removal",
            removeDrillsForInsightWidget(
                ComplexDashboardWidgets.SecondSection.FirstTable.ref,
                "*",
                TestCorrelation,
            ),
            "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED",
        ],
        // filter manipulations
        [
            "date filter change",
            applyDateFilter(newAbsoluteDateFilter("foo", "2022-01-01", "2022-12-31"), TestCorrelation),
            "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED",
        ],
        [
            "attribute filter change",
            applyAttributeFilter(
                ComplexDashboardFilters.FirstAttribute.filter.attributeFilter.localIdentifier!,
                newPositiveAttributeFilter(ComplexDashboardFilters.FirstAttribute.idRef, {
                    values: [ComplexDashboardFilters.FirstAttribute.sampleElementValue],
                }),
                TestCorrelation,
            ),
            "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_CHANGED",
        ],
        [
            "attribute filter move",
            moveAttributeFilter(
                ComplexDashboardFilters.FirstAttribute.filter.attributeFilter.localIdentifier!,
                2,
                TestCorrelation,
            ),
            "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVED",
        ],
        [
            "attribute filter removal",
            removeAttributeFilter(
                ComplexDashboardFilters.FirstAttribute.filter.attributeFilter.localIdentifier!,
                TestCorrelation,
            ),
            "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVED",
        ],
        [
            "attribute filter add",
            addAttributeFilter(ReferenceMd.Department.Default.attribute.displayForm, -1, TestCorrelation),
            "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADDED",
        ],
    ];

    it.each(scenarios)(`should detect %s`, async (_, command, event) => {
        await Tester.dispatchAndWaitFor(command, event);
        expect(Tester.select(selectIsDashboardDirty)).toBe(true);
    });
});
