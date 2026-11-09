// (C) 2022-2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    DashboardAttributeFilterConfigModeValues,
    type FilterContextItem,
    type IDashboardDefinition,
    type IGenAIDashboardLiveFilters,
    type IInsightWidgetDefinition,
    idRef,
    newAbsoluteDateFilter,
    newPositiveAttributeFilter,
    objRefToString,
} from "@gooddata/sdk-model";

import { TestCorrelation, TestStash } from "../../../tests/Dashboard.test.helpers.js";
import { renameDashboard, setDashboardMeasureValueFilterConfigMode } from "../../commands/dashboard.js";
import {
    addAttributeFilter,
    addMeasureValueFilter,
    applyAttributeFilter,
    applyDateFilter,
    changeMeasureValueFilterCondition,
    moveAttributeFilter,
    removeAttributeFilter,
} from "../../commands/filters.js";
import {
    changeInsightWidgetHeader,
    changeInsightWidgetVisProperties,
    removeDrillsForInsightWidget,
    unignoreFilterOnInsightWidget,
} from "../../commands/insight.js";
import {
    addLayoutSection,
    addSectionItem,
    changeLayoutSectionHeader,
    moveLayoutSection,
    moveSectionItem,
    removeLayoutSection,
    removeSectionItem,
    replaceSectionItem,
} from "../../commands/layout.js";
import { changeRenderMode } from "../../commands/renderMode.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import {
    ComplexDashboardFilters,
    ComplexDashboardIdentifier,
    ComplexDashboardWidgets,
} from "../../tests/ComplexDashboard.test.helpers.js";
import { type ExtendedDashboardItem } from "../../types/layoutTypes.js";
import { selectConfig } from "../config/configSelectors.js";
import { configActions } from "../config/index.js";

import { metaActions } from "./index.js";
import {
    selectDashboardAiDefinition,
    selectDashboardAiLiveFilters,
    selectDashboardWorkingDefinition,
    selectEnablePersistentFiltersAcrossTabs,
    selectIsDashboardDirty,
    selectPersistedDashboard,
    selectPersistedDashboardFilterContextAsFilterContextDefinition,
    selectPersistedDashboardFilterContextDefinitionsByTab,
    selectPersistedEnablePersistentFiltersAcrossTabs,
} from "./metaSelectors.js";

describe("selectPersistedEnablePersistentFiltersAcrossTabs", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, ComplexDashboardIdentifier);
        const config = selectConfig(Tester.state());
        Tester.dispatch(
            configActions.setConfig({
                ...config,
                settings: { ...config.settings, enableDashboardPersistentFiltersAcrossTabs: true },
            }),
        );
    });

    function persistSetting(enablePersistentFiltersAcrossTabs: boolean): void {
        const dashboard = selectPersistedDashboard(Tester.state())!;
        Tester.dispatch(
            metaActions.setMeta({ dashboard: { ...dashboard, enablePersistentFiltersAcrossTabs } }),
        );
    }

    it("ignores an unsaved enablement", () => {
        persistSetting(false);
        Tester.dispatch(metaActions.setEnablePersistentFiltersAcrossTabs(true));

        expect(Tester.select(selectEnablePersistentFiltersAcrossTabs)).toBe(true);
        expect(Tester.select(selectPersistedEnablePersistentFiltersAcrossTabs)).toBe(false);
    });

    it("ignores an unsaved disablement", () => {
        persistSetting(true);
        Tester.dispatch(metaActions.setEnablePersistentFiltersAcrossTabs(false));

        expect(Tester.select(selectEnablePersistentFiltersAcrossTabs)).toBe(false);
        expect(Tester.select(selectPersistedEnablePersistentFiltersAcrossTabs)).toBe(true);
    });
});

describe("selectIsDashboardDirty", () => {
    let Tester: DashboardTester;
    const measureRef = idRef("87a053b0-3947-49f3-b0c5-de53fd01f050", "measure");

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
        [
            "measure value filter add",
            addMeasureValueFilter(measureRef, -1, TestCorrelation, "test-mvf"),
            "GDC.DASH/EVT.FILTER_CONTEXT.MEASURE_VALUE_FILTER.ADDED",
        ],
    ];

    it.each(scenarios)(`should detect %s`, async (_, command, event) => {
        await Tester.dispatchAndWaitFor(command, event);
        expect(Tester.select(selectIsDashboardDirty)).toBe(true);
    });

    it("should detect measure value filter condition change", async () => {
        await Tester.dispatchAndWaitFor(
            addMeasureValueFilter(measureRef, -1, TestCorrelation, "test-mvf"),
            "GDC.DASH/EVT.FILTER_CONTEXT.MEASURE_VALUE_FILTER.ADDED",
        );
        await Tester.dispatchAndWaitFor(
            changeMeasureValueFilterCondition("test-mvf", [
                {
                    comparison: {
                        operator: "GREATER_THAN",
                        value: 100,
                    },
                },
            ]),
            "GDC.DASH/EVT.FILTER_CONTEXT.MEASURE_VALUE_FILTER.CONDITION_CHANGED",
        );

        expect(Tester.select(selectIsDashboardDirty)).toBe(true);
    });

    it("should detect measure value filter config change", async () => {
        await Tester.dispatchAndWaitFor(
            addMeasureValueFilter(measureRef, -1, TestCorrelation, "test-mvf"),
            "GDC.DASH/EVT.FILTER_CONTEXT.MEASURE_VALUE_FILTER.ADDED",
        );
        await Tester.dispatchAndWaitFor(
            setDashboardMeasureValueFilterConfigMode(
                "test-mvf",
                DashboardAttributeFilterConfigModeValues.READONLY,
            ),
            "GDC.DASH/EVT.MEASURE_VALUE_FILTER_CONFIG.MODE_CHANGED",
        );

        expect(Tester.select(selectIsDashboardDirty)).toBe(true);
    });
});

describe("selectDashboardAiDefinition", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, ComplexDashboardIdentifier);
    });

    const changeFirstAttributeFilter = () =>
        Tester.dispatchAndWaitFor(
            applyAttributeFilter(
                ComplexDashboardFilters.FirstAttribute.filter.attributeFilter.localIdentifier!,
                newPositiveAttributeFilter(ComplexDashboardFilters.FirstAttribute.idRef, {
                    values: [ComplexDashboardFilters.FirstAttribute.sampleElementValue],
                }),
                TestCorrelation,
            )!,
            "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_CHANGED",
        );

    it("equals the working definition in view mode when no filter changed", () => {
        expect(Tester.select(selectDashboardAiDefinition)).toEqual(
            Tester.select(selectDashboardWorkingDefinition),
        );
    });

    it("carries the persisted filters in view mode after a filter change", async () => {
        await changeFirstAttributeFilter();

        const aiFilters = Tester.select(selectDashboardAiDefinition).filterContext?.filters;
        const persisted = Tester.select(selectPersistedDashboardFilterContextAsFilterContextDefinition);

        expect(aiFilters).toEqual(persisted?.filters);
        expect(aiFilters).not.toEqual(Tester.select(selectDashboardWorkingDefinition).filterContext?.filters);
    });

    it("carries the persisted filters on every tab in view mode after a filter change", async () => {
        await changeFirstAttributeFilter();

        const tabs = Tester.select(selectDashboardAiDefinition).tabs ?? [];
        const persistedByTab = Tester.select(selectPersistedDashboardFilterContextDefinitionsByTab);

        expect(tabs.length).toBeGreaterThan(0);
        tabs.forEach((tab) => {
            expect(tab.filterContext?.filters).toEqual(persistedByTab[tab.localIdentifier]?.filters);
        });
    });

    it("gives each tab its own persisted filters", () => {
        const working = Tester.select(selectDashboardWorkingDefinition);
        const tab = (localIdentifier: string) => ({
            localIdentifier,
            title: localIdentifier,
            layout: working.layout,
            filterContext: { title: "", description: "", filters: [ComplexDashboardFilters.Date] },
        });
        const savedFirst = { title: "", description: "", filters: [] };
        const savedSecond = { title: "", description: "", filters: [ComplexDashboardFilters.Date] };
        const { resultFunc } = selectDashboardAiDefinition as unknown as {
            resultFunc: (...inputs: unknown[]) => IDashboardDefinition;
        };

        const result = resultFunc({ ...working, tabs: [tab("first"), tab("second")] }, false, savedFirst, {
            first: savedFirst,
            second: savedSecond,
        });

        expect(result.tabs?.map((t) => t.filterContext?.filters)).toEqual([
            savedFirst.filters,
            savedSecond.filters,
        ]);
    });

    it("returns the working definition itself in edit mode, unsaved filter change included", async () => {
        await Tester.dispatchAndWaitFor(
            changeRenderMode("edit", { resetDashboard: true }, TestCorrelation),
            "GDC.DASH/EVT.RENDER_MODE.CHANGED",
        );
        await changeFirstAttributeFilter();

        const working = Tester.select(selectDashboardWorkingDefinition);
        expect(Tester.select(selectDashboardAiDefinition)).toBe(working);
        expect(working.filterContext?.filters).not.toEqual(
            Tester.select(selectPersistedDashboardFilterContextAsFilterContextDefinition)?.filters,
        );
    });

    it("relays the filters on screen in view mode only", async () => {
        await changeFirstAttributeFilter();
        const working = Tester.select(selectDashboardWorkingDefinition);
        const live = Tester.select(selectDashboardAiLiveFilters);

        expect(live?.filters).toBe(working.filterContext?.filters);
        expect(live?.filters).not.toEqual(Tester.select(selectDashboardAiDefinition).filterContext?.filters);
        expect(working.tabs?.length).toBeGreaterThan(0);
        working.tabs?.forEach((tab) => {
            expect(live?.tabs?.[tab.localIdentifier]).toBe(tab.filterContext?.filters);
        });

        await Tester.dispatchAndWaitFor(
            changeRenderMode("edit", { resetDashboard: true }, TestCorrelation),
            "GDC.DASH/EVT.RENDER_MODE.CHANGED",
        );
        expect(Tester.select(selectDashboardAiLiveFilters)).toBeUndefined();
    });

    it("keys each tab's filters on screen by the tab and skips a tab without a filter context", () => {
        const working = Tester.select(selectDashboardWorkingDefinition);
        const firstFilters = [ComplexDashboardFilters.Date];
        const secondFilters: FilterContextItem[] = [];
        const tab = (localIdentifier: string, filters?: FilterContextItem[]) => ({
            localIdentifier,
            title: localIdentifier,
            layout: working.layout,
            ...(filters ? { filterContext: { title: "", description: "", filters } } : {}),
        });
        const { resultFunc } = selectDashboardAiLiveFilters as unknown as {
            resultFunc: (...inputs: unknown[]) => IGenAIDashboardLiveFilters | undefined;
        };

        const result = resultFunc(
            { ...working, tabs: [tab("first", firstFilters), tab("second", secondFilters), tab("bare")] },
            false,
        );

        expect(result?.tabs).toEqual({ first: firstFilters, second: secondFilters });
    });

    it("returns the same object when selected twice in view mode", async () => {
        await changeFirstAttributeFilter();

        expect(Tester.select(selectDashboardAiDefinition)).toBe(Tester.select(selectDashboardAiDefinition));
    });

    it("gives a persisted attribute filter without an id the id the live filter got on load", () => {
        const displayForm = ComplexDashboardFilters.FirstAttribute.filter.attributeFilter.displayForm;
        const storedFilter = {
            attributeFilter: {
                displayForm,
                negativeSelection: true,
                attributeElements: { uris: [] },
            },
        };
        const liveId = `${objRefToString(displayForm)}_1_attributeFilter`;
        const working = Tester.select(selectDashboardWorkingDefinition);
        const workingWithLiveId = {
            ...working,
            filterContext: {
                ...working.filterContext!,
                filters: [
                    ComplexDashboardFilters.Date,
                    { attributeFilter: { ...storedFilter.attributeFilter, localIdentifier: liveId } },
                ],
            },
            tabs: undefined,
        };

        // DashboardSelector hides reselect's resultFunc; the combiner is what this case pins.
        const { resultFunc } = selectDashboardAiDefinition as unknown as {
            resultFunc: (...inputs: unknown[]) => IDashboardDefinition;
        };
        const result = resultFunc(
            workingWithLiveId,
            false,
            { filters: [ComplexDashboardFilters.Date, storedFilter] },
            {},
        );

        expect(result.filterContext?.filters[1]).toEqual({
            attributeFilter: { ...storedFilter.attributeFilter, localIdentifier: liveId },
        });
    });
});
