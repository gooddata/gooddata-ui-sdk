// (C) 2023-2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    type DashboardAttributeFilterSelectionMode,
    type FilterContextItem,
    type IAttributeElementsByRef,
    type IDashboard,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardMeasureValueFilter,
    type ObjRef,
    dashboardAttributeFilterItemFilterElementsBy,
    dashboardAttributeFilterItemLocalIdentifier,
    idRef,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { createDefaultFilterContext } from "../../../_staging/dashboard/defaultFilterContext.js";
import { defaultDateFilterConfig } from "../../../_staging/dateFilterConfig/defaultConfig.js";
import {
    EmptyDashboardIdentifier,
    EmptyDashboardWithReferences,
} from "../../../tests/Dashboard.test.helpers.js";
import {
    addAttributeFilter,
    addTextAttributeFilter,
    changeFilterContextSelection,
    changeFilterContextSelectionByParams,
    removeAttributeFilter,
} from "../../commands/filters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { selectRestrictedDashboardFilterLocalIdentifiers } from "../../store/filtering/dashboardFilterSelectors.js";
import {
    selectFilterContextAttributeFilterByDisplayForm,
    selectFilterContextAttributeFilterItemByDisplayForm,
    selectFilterContextAttributeFilterItemByLocalId,
    selectFilterContextAttributeFilters,
    selectFilterContextDateFilter,
    selectFilterContextMeasureValueFilters,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { unavailableObjectsActions } from "../../store/unavailableObjects/index.js";
import { type PrivateDashboardContext } from "../../types/commonTypes.js";
import { EmptyDashboardLayout } from "../dashboard/common/dashboardInitialize.js";

describe("change filter context selection handler", () => {
    const FILTER_ELEMENTS = ["element1", "element2", "element3"];
    const FIRST_ELEMENT = [FILTER_ELEMENTS[0]];

    const dashboardWithDefaults: IDashboard = {
        ...EmptyDashboardWithReferences.dashboard,
        ref: idRef(EmptyDashboardIdentifier),
        identifier: EmptyDashboardIdentifier,
        layout: EmptyDashboardLayout,
        filterContext: createDefaultFilterContext(
            defaultDateFilterConfig,
            true,
        ) as IDashboard["filterContext"],
    };

    const customizationFnsWithPreload: PrivateDashboardContext = {
        preloadedDashboard: dashboardWithDefaults,
    };

    const addFilter = async (
        Tester: DashboardTester,
        displayForm: ObjRef,
        selection: DashboardAttributeFilterSelectionMode = "single",
    ) => {
        await Tester.dispatchAndWaitFor(
            addAttributeFilter(displayForm, 0, undefined, selection),
            "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADD",
        );
    };

    const changeFilterSelection = async (
        Tester: DashboardTester,
        filterSelection: {
            displayForm: ObjRef;
            negativeSelection: boolean;
            elements: string[];
            selectionMode?: DashboardAttributeFilterSelectionMode;
        },
    ) => {
        await Tester.dispatchAndWaitFor(
            changeFilterContextSelection([
                {
                    attributeFilter: {
                        displayForm: filterSelection.displayForm,
                        negativeSelection: filterSelection.negativeSelection,
                        attributeElements: {
                            uris: filterSelection.elements,
                        },
                        selectionMode: filterSelection.selectionMode,
                    },
                },
            ]),
            "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
        );
    };

    const getFilters = (Tester: DashboardTester) => {
        const filters = selectFilterContextAttributeFilters(Tester.state());
        const elements = filters.map(
            (filter) => filter.attributeFilter.attributeElements as IAttributeElementsByRef,
        );
        return {
            filters,
            elements,
        };
    };

    describe("single select filter", () => {
        const DASHBOARD_FILTER_DISPLAY_FORM = {
            identifier: "f_owner.region_id",
        };

        let Tester: DashboardTester;
        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                EmptyDashboardIdentifier,
                {
                    customizationFns: customizationFnsWithPreload,
                },
            );
        });

        const removeFilter = async () => {
            const filters = selectFilterContextAttributeFilters(Tester.state());
            await Tester.dispatchAndWaitFor(
                removeAttributeFilter(filters[0].attributeFilter.localIdentifier!),
                "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVE",
            );
        };

        it("should cast positive multi select filter into single select", async () => {
            await addFilter(Tester, DASHBOARD_FILTER_DISPLAY_FORM, "single");
            await changeFilterSelection(Tester, {
                displayForm: DASHBOARD_FILTER_DISPLAY_FORM,
                negativeSelection: false,
                elements: FILTER_ELEMENTS,
            });

            const { filters, elements } = getFilters(Tester);

            expect(elements[0].uris).toEqual(FIRST_ELEMENT);
            expect(filters[0].attributeFilter.negativeSelection).toEqual(false);
            expect(filters[0].attributeFilter.selectionMode).toEqual("single");

            await removeFilter();
        });

        it("should cast negative multi select filter into single select", async () => {
            await addFilter(Tester, DASHBOARD_FILTER_DISPLAY_FORM, "single");
            await changeFilterSelection(Tester, {
                displayForm: DASHBOARD_FILTER_DISPLAY_FORM,
                negativeSelection: true,
                elements: FILTER_ELEMENTS,
            });

            const { filters, elements } = getFilters(Tester);

            expect(elements[0].uris).toEqual([]);
            expect(filters[0].attributeFilter.negativeSelection).toEqual(false);
            expect(filters[0].attributeFilter.selectionMode).toEqual("single");

            await removeFilter();
        });

        it("should cast multi select filter with one value into single select", async () => {
            await addFilter(Tester, DASHBOARD_FILTER_DISPLAY_FORM, "single");
            await changeFilterSelection(Tester, {
                displayForm: DASHBOARD_FILTER_DISPLAY_FORM,
                negativeSelection: false,
                elements: FIRST_ELEMENT,
            });

            const { filters, elements } = getFilters(Tester);

            expect(elements[0].uris).toEqual(FIRST_ELEMENT);
            expect(filters[0].attributeFilter.negativeSelection).toEqual(false);
            expect(filters[0].attributeFilter.selectionMode).toEqual("single");

            await removeFilter();
        });

        it("should cast single select filter into multi select", async () => {
            await addFilter(Tester, DASHBOARD_FILTER_DISPLAY_FORM, "multi");
            await changeFilterSelection(Tester, {
                displayForm: DASHBOARD_FILTER_DISPLAY_FORM,
                negativeSelection: false,
                elements: FIRST_ELEMENT,
                selectionMode: "single",
            });

            const { filters, elements } = getFilters(Tester);

            expect(elements[0].uris).toEqual(FIRST_ELEMENT);
            expect(filters[0].attributeFilter.negativeSelection).toEqual(false);
            expect(filters[0].attributeFilter.selectionMode).toEqual("multi");

            await removeFilter();
        });
    });

    describe("apply selection from another attribute display form", () => {
        const DASHBOARD_FILTER_DISPLAY_FORM = {
            identifier: "f_owner.region_id",
        };
        const FILTER_COMMAND_DISPLAY_FORM = {
            identifier: "f_owner.region_id.regionhyperlink",
        };

        describe("backend supportsElementUris", () => {
            let Tester: DashboardTester;
            beforeEach(async () => {
                await preloadedTesterFactory(
                    async (tester) => {
                        Tester = tester;
                        await addFilter(Tester, DASHBOARD_FILTER_DISPLAY_FORM);
                        await changeFilterSelection(Tester, {
                            displayForm: DASHBOARD_FILTER_DISPLAY_FORM,
                            negativeSelection: false,
                            elements: FIRST_ELEMENT,
                        });
                    },
                    EmptyDashboardIdentifier,
                    {
                        customizationFns: customizationFnsWithPreload,
                    },
                );
            });

            it("should apply elements from command correctly", async () => {
                await changeFilterSelection(Tester, {
                    displayForm: FILTER_COMMAND_DISPLAY_FORM,
                    negativeSelection: false,
                    elements: [FILTER_ELEMENTS[1]],
                });
                const { elements } = getFilters(Tester);
                expect(elements[0].uris).toEqual([FILTER_ELEMENTS[1]]);
            });
        });
    });

    describe("match by localIdentifier", () => {
        const SHARED_DISPLAY_FORM = {
            identifier: "f_owner.region_id",
        };
        const FIRST_FILTER_LOCAL_ID = "first_filter_with_shared_df";
        const SECOND_FILTER_LOCAL_ID = "second_filter_with_shared_df";

        const sharedDisplayFormFilter = (localIdentifier: string): IDashboardAttributeFilter => ({
            attributeFilter: {
                displayForm: SHARED_DISPLAY_FORM,
                attributeElements: { uris: [] },
                negativeSelection: true,
                localIdentifier,
                selectionMode: "multi",
            },
        });

        const filterSelection = (localIdentifier: string, elements: string[]): IDashboardAttributeFilter => ({
            attributeFilter: {
                displayForm: SHARED_DISPLAY_FORM,
                attributeElements: { uris: elements },
                negativeSelection: false,
                localIdentifier,
                selectionMode: "multi",
            },
        });

        const defaultFilterContext = createDefaultFilterContext(defaultDateFilterConfig, true);
        const dashboardWithSharedDisplayFormFilters: IDashboard = {
            ...EmptyDashboardWithReferences.dashboard,
            ref: idRef(EmptyDashboardIdentifier),
            identifier: EmptyDashboardIdentifier,
            layout: EmptyDashboardLayout,
            filterContext: {
                ...defaultFilterContext,
                filters: [
                    ...defaultFilterContext.filters,
                    sharedDisplayFormFilter(FIRST_FILTER_LOCAL_ID),
                    sharedDisplayFormFilter(SECOND_FILTER_LOCAL_ID),
                ],
            } as IDashboard["filterContext"],
        };

        const getFilterByLocalId = (Tester: DashboardTester, localIdentifier: string) => {
            const filters = selectFilterContextAttributeFilters(Tester.state());
            return filters.find((filter) => filter.attributeFilter.localIdentifier === localIdentifier)!;
        };

        const sharedDisplayFormCustomizationFns: PrivateDashboardContext = {
            preloadedDashboard: dashboardWithSharedDisplayFormFilters,
        };

        let Tester: DashboardTester;
        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                EmptyDashboardIdentifier,
                {
                    customizationFns: sharedDisplayFormCustomizationFns,
                },
            );
        });

        it("should update the filter addressed by localIdentifier when the option is enabled", async () => {
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [filterSelection(SECOND_FILTER_LOCAL_ID, FIRST_ELEMENT)],
                    matchByLocalIdentifier: true,
                }),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const first = getFilterByLocalId(Tester, FIRST_FILTER_LOCAL_ID);
            const second = getFilterByLocalId(Tester, SECOND_FILTER_LOCAL_ID);

            expect((second.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual(
                FIRST_ELEMENT,
            );
            expect(second.attributeFilter.negativeSelection).toEqual(false);
            expect((first.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual([]);
            expect(first.attributeFilter.negativeSelection).toEqual(true);
        });

        it("should apply both same display form filters from one payload when the option is enabled", async () => {
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [
                        filterSelection(FIRST_FILTER_LOCAL_ID, FIRST_ELEMENT),
                        filterSelection(SECOND_FILTER_LOCAL_ID, [FILTER_ELEMENTS[1]]),
                    ],
                    matchByLocalIdentifier: true,
                }),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const first = getFilterByLocalId(Tester, FIRST_FILTER_LOCAL_ID);
            const second = getFilterByLocalId(Tester, SECOND_FILTER_LOCAL_ID);

            expect((first.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual(
                FIRST_ELEMENT,
            );
            expect((second.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual([
                FILTER_ELEMENTS[1],
            ]);
        });

        it("should fall back to display form matching for a localIdentifier that is not present", async () => {
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [filterSelection("unknown_local_id", FIRST_ELEMENT)],
                    matchByLocalIdentifier: true,
                }),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const first = getFilterByLocalId(Tester, FIRST_FILTER_LOCAL_ID);
            const second = getFilterByLocalId(Tester, SECOND_FILTER_LOCAL_ID);

            expect((first.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual(
                FIRST_ELEMENT,
            );
            expect((second.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual([]);
        });

        it("should not let a stale payload entry override an exact localIdentifier match", async () => {
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [
                        filterSelection(FIRST_FILTER_LOCAL_ID, FIRST_ELEMENT),
                        filterSelection("stale_local_id", [FILTER_ELEMENTS[2]]),
                    ],
                    matchByLocalIdentifier: true,
                }),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const first = getFilterByLocalId(Tester, FIRST_FILTER_LOCAL_ID);
            const second = getFilterByLocalId(Tester, SECOND_FILTER_LOCAL_ID);

            // the exact match keeps its selection; the stale entry falls back to the next
            // unclaimed filter with the same display form instead of overriding the exact match
            expect((first.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual(
                FIRST_ELEMENT,
            );
            expect((second.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual([
                FILTER_ELEMENTS[2],
            ]);
        });

        it("should ignore a localIdentifier match whose display form differs", async () => {
            const OTHER_DISPLAY_FORM = {
                identifier: "f_owner.region_id.regionhyperlink",
            };
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [
                        {
                            attributeFilter: {
                                displayForm: OTHER_DISPLAY_FORM,
                                attributeElements: { uris: FIRST_ELEMENT },
                                negativeSelection: false,
                                localIdentifier: SECOND_FILTER_LOCAL_ID,
                                selectionMode: "multi",
                            },
                        },
                    ],
                    matchByLocalIdentifier: true,
                }),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const first = getFilterByLocalId(Tester, FIRST_FILTER_LOCAL_ID);
            const second = getFilterByLocalId(Tester, SECOND_FILTER_LOCAL_ID);

            // element values are not transferable across display forms, so the localIdentifier owner
            // must stay untouched and the entry resolves through display form matching instead
            expect((second.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual([]);
            expect(second.attributeFilter.negativeSelection).toEqual(true);
            expect((first.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual(
                FIRST_ELEMENT,
            );
        });

        it("should map each stale payload entry to its own fallback target", async () => {
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [
                        filterSelection("stale_local_id_1", [FILTER_ELEMENTS[1]]),
                        filterSelection("stale_local_id_2", [FILTER_ELEMENTS[2]]),
                    ],
                    matchByLocalIdentifier: true,
                }),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const first = getFilterByLocalId(Tester, FIRST_FILTER_LOCAL_ID);
            const second = getFilterByLocalId(Tester, SECOND_FILTER_LOCAL_ID);

            // fallback matching is one-to-one: two stale entries must not update the same filter
            // (entries are processed in reverse payload order)
            expect((first.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual([
                FILTER_ELEMENTS[2],
            ]);
            expect((second.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual([
                FILTER_ELEMENTS[1],
            ]);
        });

        it("should not let an entry with a foreign display form overwrite an exact match via its localIdentifier", async () => {
            const OTHER_DISPLAY_FORM = {
                identifier: "f_owner.region_id.regionhyperlink",
            };
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [
                        filterSelection(FIRST_FILTER_LOCAL_ID, FIRST_ELEMENT),
                        {
                            attributeFilter: {
                                displayForm: OTHER_DISPLAY_FORM,
                                attributeElements: { uris: [FILTER_ELEMENTS[2]] },
                                negativeSelection: false,
                                localIdentifier: FIRST_FILTER_LOCAL_ID,
                                selectionMode: "multi",
                            },
                        },
                    ],
                    matchByLocalIdentifier: true,
                }),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const first = getFilterByLocalId(Tester, FIRST_FILTER_LOCAL_ID);

            // the compatible entry wins; the same-localIdentifier entry carrying another display
            // form must not replace its selection with foreign display form elements
            expect((first.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual(
                FIRST_ELEMENT,
            );
        });

        it("should drop a stale entry when every filter with its display form is exactly addressed", async () => {
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [
                        filterSelection("stale_local_id", [FILTER_ELEMENTS[2]]),
                        filterSelection(FIRST_FILTER_LOCAL_ID, FIRST_ELEMENT),
                        filterSelection(SECOND_FILTER_LOCAL_ID, [FILTER_ELEMENTS[1]]),
                    ],
                    matchByLocalIdentifier: true,
                }),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const first = getFilterByLocalId(Tester, FIRST_FILTER_LOCAL_ID);
            const second = getFilterByLocalId(Tester, SECOND_FILTER_LOCAL_ID);

            // with both display form filters exactly addressed the stale entry has no free target;
            // the attribute-matching fallback must not resolve it back onto a claimed filter
            expect((first.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual(
                FIRST_ELEMENT,
            );
            expect((second.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual([
                FILTER_ELEMENTS[1],
            ]);
        });

        it("should remap a taken attribute-matching fallback onto the next free filter", async () => {
            const OTHER_DISPLAY_FORM = {
                identifier: "f_owner.region_id.regionhyperlink",
            };
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [
                        {
                            attributeFilter: {
                                displayForm: OTHER_DISPLAY_FORM,
                                attributeElements: { uris: [FILTER_ELEMENTS[2]] },
                                negativeSelection: false,
                                localIdentifier: "stale_local_id",
                                selectionMode: "multi",
                            },
                        },
                        filterSelection(FIRST_FILTER_LOCAL_ID, FIRST_ELEMENT),
                    ],
                    matchByLocalIdentifier: true,
                }),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const first = getFilterByLocalId(Tester, FIRST_FILTER_LOCAL_ID);
            const second = getFilterByLocalId(Tester, SECOND_FILTER_LOCAL_ID);

            // the stale entry resolves through attribute matching to the claimed first filter;
            // it must remap onto the free second filter instead of overriding or being dropped
            expect((first.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual(
                FIRST_ELEMENT,
            );
            expect((second.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual([
                FILTER_ELEMENTS[2],
            ]);
        });

        it("should migrate a stale text entry onto the next free filter with its display form", async () => {
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [
                        {
                            arbitraryAttributeFilter: {
                                displayForm: SHARED_DISPLAY_FORM,
                                values: ["migrated"],
                                negativeSelection: false,
                                localIdentifier: "stale_text_local_id",
                            },
                        },
                        filterSelection(FIRST_FILTER_LOCAL_ID, FIRST_ELEMENT),
                    ],
                    matchByLocalIdentifier: true,
                }),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const first = getFilterByLocalId(Tester, FIRST_FILTER_LOCAL_ID);
            const migrated = selectFilterContextAttributeFilterItemByLocalId(SECOND_FILTER_LOCAL_ID)(
                Tester.state(),
            );

            // the exactly addressed first filter keeps its selection; the stale text entry
            // migrates onto the free second filter instead of being dropped
            expect((first.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual(
                FIRST_ELEMENT,
            );
            expect(migrated && isDashboardArbitraryAttributeFilter(migrated)).toBe(true);
            expect(
                migrated && isDashboardArbitraryAttributeFilter(migrated)
                    ? migrated.arbitraryAttributeFilter.values
                    : undefined,
            ).toEqual(["migrated"]);
        });

        it("should not let a stale list entry consume an exactly addressed text filter", async () => {
            const TEXT_DISPLAY_FORM = ReferenceMd.Product.Name.attribute.displayForm;
            await Tester.dispatchAndWaitFor(
                addTextAttributeFilter(
                    {
                        arbitraryAttributeFilter: {
                            displayForm: TEXT_DISPLAY_FORM,
                            values: ["original"],
                            negativeSelection: false,
                        },
                    },
                    0,
                ),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );
            const addedTextFilter = selectFilterContextAttributeFilterItemByDisplayForm(TEXT_DISPLAY_FORM)(
                Tester.state(),
            );
            const textFilterLocalId = dashboardAttributeFilterItemLocalIdentifier(addedTextFilter!)!;

            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [
                        {
                            arbitraryAttributeFilter: {
                                displayForm: TEXT_DISPLAY_FORM,
                                values: ["kept"],
                                negativeSelection: false,
                                localIdentifier: textFilterLocalId,
                            },
                        },
                        {
                            attributeFilter: {
                                displayForm: TEXT_DISPLAY_FORM,
                                attributeElements: { uris: [FILTER_ELEMENTS[2]] },
                                negativeSelection: false,
                                localIdentifier: "stale_list_local_id",
                                selectionMode: "multi",
                            },
                        },
                    ],
                    matchByLocalIdentifier: true,
                }),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            // the stale list entry must not consume the text filter via the list→text migration;
            // the exact text entry keeps the filter's type and applies its values
            const textFilter = selectFilterContextAttributeFilterItemByLocalId(textFilterLocalId)(
                Tester.state(),
            );
            expect(textFilter && isDashboardArbitraryAttributeFilter(textFilter)).toBe(true);
            expect(
                textFilter && isDashboardArbitraryAttributeFilter(textFilter)
                    ? textFilter.arbitraryAttributeFilter.values
                    : undefined,
            ).toEqual(["kept"]);
        });

        describe("with two text filters on one display form", () => {
            const FIRST_TEXT_LOCAL_ID = "first_text_filter";
            const SECOND_TEXT_LOCAL_ID = "second_text_filter";
            const textFiltersCustomizationFns: PrivateDashboardContext = {
                preloadedDashboard: {
                    ...EmptyDashboardWithReferences.dashboard,
                    ref: idRef(EmptyDashboardIdentifier),
                    identifier: EmptyDashboardIdentifier,
                    layout: EmptyDashboardLayout,
                    filterContext: {
                        ...defaultFilterContext,
                        filters: [
                            ...defaultFilterContext.filters,
                            {
                                arbitraryAttributeFilter: {
                                    displayForm: SHARED_DISPLAY_FORM,
                                    values: ["first"],
                                    negativeSelection: false,
                                    localIdentifier: FIRST_TEXT_LOCAL_ID,
                                },
                            },
                            {
                                arbitraryAttributeFilter: {
                                    displayForm: SHARED_DISPLAY_FORM,
                                    values: ["second"],
                                    negativeSelection: false,
                                    localIdentifier: SECOND_TEXT_LOCAL_ID,
                                },
                            },
                        ],
                    } as IDashboard["filterContext"],
                },
            };

            let TextTester: DashboardTester;
            beforeEach(async () => {
                await preloadedTesterFactory(
                    (tester) => {
                        TextTester = tester;
                    },
                    EmptyDashboardIdentifier,
                    {
                        customizationFns: textFiltersCustomizationFns,
                    },
                );
            });

            it("should migrate a stale list entry onto the free text filter when the first is exactly addressed", async () => {
                await TextTester.dispatchAndWaitFor(
                    changeFilterContextSelectionByParams({
                        filters: [
                            filterSelection("stale_local_id", [FILTER_ELEMENTS[2]]),
                            {
                                arbitraryAttributeFilter: {
                                    displayForm: SHARED_DISPLAY_FORM,
                                    values: ["kept"],
                                    negativeSelection: false,
                                    localIdentifier: FIRST_TEXT_LOCAL_ID,
                                },
                            },
                        ],
                        matchByLocalIdentifier: true,
                    }),
                    "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
                );

                // the exactly addressed text filter keeps its values; the stale list entry
                // migrates onto the free second text filter instead of being dropped
                const first = selectFilterContextAttributeFilterItemByLocalId(FIRST_TEXT_LOCAL_ID)(
                    TextTester.state(),
                );
                expect(first && isDashboardArbitraryAttributeFilter(first)).toBe(true);
                expect(
                    first && isDashboardArbitraryAttributeFilter(first)
                        ? first.arbitraryAttributeFilter.values
                        : undefined,
                ).toEqual(["kept"]);

                const second = selectFilterContextAttributeFilterItemByLocalId(SECOND_TEXT_LOCAL_ID)(
                    TextTester.state(),
                );
                expect(second && isDashboardAttributeFilter(second)).toBe(true);
                expect(
                    second && isDashboardAttributeFilter(second)
                        ? (second.attributeFilter.attributeElements as IAttributeElementsByRef).uris
                        : undefined,
                ).toEqual([FILTER_ELEMENTS[2]]);
            });

            it("should not substitute a text filter restricted through its parent for a stale entry", async () => {
                const RESTRICTED_LABEL = idRef("restricted_label", "displayForm");
                const RESTRICTED_PARENT_LOCAL_ID = "restricted_parent";
                TextTester.dispatch(
                    unavailableObjectsActions.setUnavailableObjects([
                        { ref: RESTRICTED_LABEL, type: "displayForm", reason: "forbidden" },
                    ]),
                );
                TextTester.dispatch(
                    tabsActions.addAttributeFilter({
                        displayForm: RESTRICTED_LABEL,
                        index: 0,
                        initialSelection: { uris: FIRST_ELEMENT },
                        localIdentifier: RESTRICTED_PARENT_LOCAL_ID,
                    }),
                );
                TextTester.dispatch(
                    tabsActions.setAttributeFilterParents({
                        filterLocalId: SECOND_TEXT_LOCAL_ID,
                        parentFilters: [
                            { filterLocalIdentifier: RESTRICTED_PARENT_LOCAL_ID, over: { attributes: [] } },
                        ],
                    }),
                );

                await TextTester.dispatchAndWaitFor(
                    changeFilterContextSelectionByParams({
                        filters: [
                            {
                                arbitraryAttributeFilter: {
                                    displayForm: SHARED_DISPLAY_FORM,
                                    values: ["kept"],
                                    negativeSelection: false,
                                    localIdentifier: FIRST_TEXT_LOCAL_ID,
                                },
                            },
                            {
                                arbitraryAttributeFilter: {
                                    displayForm: SHARED_DISPLAY_FORM,
                                    values: ["stale"],
                                    negativeSelection: false,
                                    localIdentifier: "stale_local_id",
                                },
                            },
                        ],
                        matchByLocalIdentifier: true,
                    }),
                    "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
                );

                const second = selectFilterContextAttributeFilterItemByLocalId(SECOND_TEXT_LOCAL_ID)(
                    TextTester.state(),
                );
                expect(
                    second && isDashboardArbitraryAttributeFilter(second)
                        ? second.arbitraryAttributeFilter.values
                        : undefined,
                ).toEqual(["second"]);
            });
        });

        it("should keep the exact match when the payload gives the display form as a URI ref", async () => {
            const SHARED_DISPLAY_FORM_URI = {
                uri: "https://automation.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/referenceworkspace/labels/f_owner.region_id",
            };
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [
                        {
                            attributeFilter: {
                                displayForm: SHARED_DISPLAY_FORM_URI,
                                attributeElements: { uris: FIRST_ELEMENT },
                                negativeSelection: false,
                                localIdentifier: SECOND_FILTER_LOCAL_ID,
                                selectionMode: "multi",
                            },
                        },
                    ],
                    matchByLocalIdentifier: true,
                }),
                // the URI ref forces an async display form resolution, so the test must wait for
                // the completion event and not only for the command
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            const first = getFilterByLocalId(Tester, FIRST_FILTER_LOCAL_ID);
            const second = getFilterByLocalId(Tester, SECOND_FILTER_LOCAL_ID);

            // the URI ref and the identifier ref point to the same display form, so the exact
            // localIdentifier match must hold and the first filter must stay untouched
            expect((second.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual(
                FIRST_ELEMENT,
            );
            expect((first.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual([]);
        });

        describe("with mixed ref forms between the fallback candidates", () => {
            const SHARED_DISPLAY_FORM_URI = {
                uri: "https://automation.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/referenceworkspace/labels/f_owner.region_id",
            };
            const mixedRefsCustomizationFns: PrivateDashboardContext = {
                preloadedDashboard: {
                    ...EmptyDashboardWithReferences.dashboard,
                    ref: idRef(EmptyDashboardIdentifier),
                    identifier: EmptyDashboardIdentifier,
                    layout: EmptyDashboardLayout,
                    filterContext: {
                        ...defaultFilterContext,
                        filters: [
                            ...defaultFilterContext.filters,
                            sharedDisplayFormFilter(FIRST_FILTER_LOCAL_ID),
                            {
                                attributeFilter: {
                                    displayForm: SHARED_DISPLAY_FORM_URI,
                                    attributeElements: { uris: [] },
                                    negativeSelection: true,
                                    localIdentifier: SECOND_FILTER_LOCAL_ID,
                                    selectionMode: "multi",
                                },
                            },
                        ],
                    } as IDashboard["filterContext"],
                },
            };

            let MixedRefsTester: DashboardTester;
            beforeEach(async () => {
                await preloadedTesterFactory(
                    (tester) => {
                        MixedRefsTester = tester;
                    },
                    EmptyDashboardIdentifier,
                    {
                        customizationFns: mixedRefsCustomizationFns,
                    },
                );
            });

            it("should substitute a free filter that gives the display form as a URI ref", async () => {
                await MixedRefsTester.dispatchAndWaitFor(
                    changeFilterContextSelectionByParams({
                        filters: [
                            filterSelection("stale_local_id", [FILTER_ELEMENTS[2]]),
                            filterSelection(FIRST_FILTER_LOCAL_ID, FIRST_ELEMENT),
                        ],
                        matchByLocalIdentifier: true,
                    }),
                    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                );

                const first = getFilterByLocalId(MixedRefsTester, FIRST_FILTER_LOCAL_ID);
                const second = getFilterByLocalId(MixedRefsTester, SECOND_FILTER_LOCAL_ID);

                // the identifier ref and the URI ref point to the same display form, so the free
                // second filter is a valid substitute for the stale entry
                expect((first.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual(
                    FIRST_ELEMENT,
                );
                expect((second.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual([
                    FILTER_ELEMENTS[2],
                ]);
            });
        });

        describe("with a single-selection filter between the fallback candidates", () => {
            const SINGLE_FILTER_LOCAL_ID = "single_selection_filter";
            const TEXT_FILTER_LOCAL_ID = "text_filter";
            const mixedKindsCustomizationFns: PrivateDashboardContext = {
                preloadedDashboard: {
                    ...EmptyDashboardWithReferences.dashboard,
                    ref: idRef(EmptyDashboardIdentifier),
                    identifier: EmptyDashboardIdentifier,
                    layout: EmptyDashboardLayout,
                    filterContext: {
                        ...defaultFilterContext,
                        filters: [
                            ...defaultFilterContext.filters,
                            sharedDisplayFormFilter(FIRST_FILTER_LOCAL_ID),
                            {
                                attributeFilter: {
                                    displayForm: SHARED_DISPLAY_FORM,
                                    attributeElements: { uris: [] },
                                    negativeSelection: false,
                                    localIdentifier: SINGLE_FILTER_LOCAL_ID,
                                    selectionMode: "single",
                                },
                            },
                            {
                                arbitraryAttributeFilter: {
                                    displayForm: SHARED_DISPLAY_FORM,
                                    values: ["original"],
                                    negativeSelection: false,
                                    localIdentifier: TEXT_FILTER_LOCAL_ID,
                                },
                            },
                        ],
                    } as IDashboard["filterContext"],
                },
            };

            let MixedTester: DashboardTester;
            beforeEach(async () => {
                await preloadedTesterFactory(
                    (tester) => {
                        MixedTester = tester;
                    },
                    EmptyDashboardIdentifier,
                    {
                        customizationFns: mixedKindsCustomizationFns,
                    },
                );
            });

            it("should skip a substitute that cannot accept the entry", async () => {
                await MixedTester.dispatchAndWaitFor(
                    changeFilterContextSelectionByParams({
                        filters: [
                            {
                                arbitraryAttributeFilter: {
                                    displayForm: SHARED_DISPLAY_FORM,
                                    values: ["migrated"],
                                    negativeSelection: false,
                                    localIdentifier: "stale_text_local_id",
                                },
                            },
                            filterSelection(FIRST_FILTER_LOCAL_ID, FIRST_ELEMENT),
                        ],
                        matchByLocalIdentifier: true,
                    }),
                    "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
                );

                // the single-selection filter cannot accept a text entry; the stale text entry
                // must continue past it and land on the compatible text filter
                const textFilter = selectFilterContextAttributeFilterItemByLocalId(TEXT_FILTER_LOCAL_ID)(
                    MixedTester.state(),
                );
                expect(textFilter && isDashboardArbitraryAttributeFilter(textFilter)).toBe(true);
                expect(
                    textFilter && isDashboardArbitraryAttributeFilter(textFilter)
                        ? textFilter.arbitraryAttributeFilter.values
                        : undefined,
                ).toEqual(["migrated"]);

                const single = getFilterByLocalId(MixedTester, SINGLE_FILTER_LOCAL_ID);
                expect((single.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual(
                    [],
                );
            });
        });

        it("should keep matching by display form when the option is not enabled", async () => {
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelection([filterSelection(SECOND_FILTER_LOCAL_ID, FIRST_ELEMENT)]),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const first = getFilterByLocalId(Tester, FIRST_FILTER_LOCAL_ID);
            const second = getFilterByLocalId(Tester, SECOND_FILTER_LOCAL_ID);

            expect((first.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual(
                FIRST_ELEMENT,
            );
            expect((second.attributeFilter.attributeElements as IAttributeElementsByRef).uris).toEqual([]);
        });
    });

    describe("restricted attribute filter", () => {
        const RESTRICTED_LABEL = idRef("restricted_label", "displayForm");
        const RESTRICTED_LOCAL_ID = "restricted_filter";
        const RESTRICTED_TEXT_LABEL = idRef("restricted_text_label", "displayForm");
        const RESTRICTED_TEXT_LOCAL_ID = "restricted_text_filter";

        const restrictedFilter = (elements: string[]): IDashboardAttributeFilter => ({
            attributeFilter: {
                displayForm: RESTRICTED_LABEL,
                attributeElements: { uris: elements },
                negativeSelection: false,
                localIdentifier: RESTRICTED_LOCAL_ID,
            },
        });

        // Mirrors the state after a load with the label restricted: the filter is kept, its label is
        // not resolved, and resolving it would fail.
        let Tester: DashboardTester;
        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                EmptyDashboardIdentifier,
                {
                    customizationFns: customizationFnsWithPreload,
                },
            );
            Tester.dispatch(
                unavailableObjectsActions.setUnavailableObjects([
                    { ref: RESTRICTED_LABEL, type: "displayForm", reason: "forbidden" },
                    { ref: RESTRICTED_TEXT_LABEL, type: "displayForm", reason: "forbidden" },
                ]),
            );
            Tester.dispatch(
                tabsActions.addAttributeFilter({
                    displayForm: RESTRICTED_LABEL,
                    index: 0,
                    initialSelection: { uris: FIRST_ELEMENT },
                    localIdentifier: RESTRICTED_LOCAL_ID,
                }),
            );
            Tester.dispatch(
                tabsActions.addTextAttributeFilter({
                    filter: {
                        arbitraryAttributeFilter: {
                            displayForm: RESTRICTED_TEXT_LABEL,
                            values: ["stored"],
                            negativeSelection: false,
                            localIdentifier: RESTRICTED_TEXT_LOCAL_ID,
                        },
                    },
                    index: 1,
                }),
            );
        });

        const getRestrictedFilterElements = () =>
            (
                selectFilterContextAttributeFilterItemByLocalId(RESTRICTED_LOCAL_ID)(
                    Tester.state(),
                ) as IDashboardAttributeFilter
            ).attributeFilter.attributeElements;

        const getRestrictedTextFilterValues = () => {
            const filter = selectFilterContextAttributeFilterItemByLocalId(RESTRICTED_TEXT_LOCAL_ID)(
                Tester.state(),
            );
            return filter && isDashboardArbitraryAttributeFilter(filter)
                ? filter.arbitraryAttributeFilter.values
                : undefined;
        };

        it.each([
            ["a payload entry for it", false],
            ["resetOthers", true],
        ])(
            "should apply the other filters and keep the restricted selections with %s",
            async (_, resetOthers) => {
                await Tester.dispatchAndWaitFor(
                    changeFilterContextSelectionByParams({
                        filters: [
                            ...(resetOthers ? [] : [restrictedFilter(FILTER_ELEMENTS)]),
                            newRelativeDashboardDateFilter("GDC.time.date", -6, 0),
                        ],
                        resetOthers,
                        matchByLocalIdentifier: true,
                    }),
                    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                );

                expect(selectFilterContextDateFilter(Tester.state())?.dateFilter).toMatchObject({
                    type: "relative",
                    from: -6,
                    to: 0,
                });
                expect(getRestrictedFilterElements()).toEqual({ uris: FIRST_ELEMENT });
                expect(getRestrictedTextFilterValues()).toEqual(["stored"]);
            },
        );

        it("should keep the selection of a child of a restricted parent matched by its display form", async () => {
            const childLabel = ReferenceMd.Product.Name.attribute.displayForm;
            await Tester.dispatchAndWaitFor(
                addAttributeFilter(childLabel, 2, undefined, "multi"),
                "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADDED",
            );
            const getChild = () => {
                const child = selectFilterContextAttributeFilterByDisplayForm(childLabel)(Tester.state());
                if (!child?.attributeFilter.localIdentifier) {
                    throw new Error("The child filter was not added.");
                }
                return child;
            };
            const childLocalId = dashboardAttributeFilterItemLocalIdentifier(getChild()) ?? "";
            Tester.dispatch(
                tabsActions.setAttributeFilterParents({
                    filterLocalId: childLocalId,
                    parentFilters: [{ filterLocalIdentifier: RESTRICTED_LOCAL_ID, over: { attributes: [] } }],
                }),
            );
            const storedElements = getChild().attributeFilter.attributeElements;

            // an entry without a local identifier, as a drill or an embedding host sends it
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [
                        newPositiveAttributeFilter(childLabel, { uris: FILTER_ELEMENTS }),
                        newRelativeDashboardDateFilter("GDC.time.date", -6, 0),
                    ],
                }),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            expect(getChild().attributeFilter.attributeElements).toEqual(storedElements);
            expect(selectFilterContextDateFilter(Tester.state())?.dateFilter).toMatchObject({ from: -6 });
        });

        it("should apply a readable entry whose foreign local identifier names a restricted filter", async () => {
            const readableLabel = ReferenceMd.Product.Name.attribute.displayForm;
            await Tester.dispatchAndWaitFor(
                addAttributeFilter(readableLabel, 2, undefined, "multi"),
                "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADDED",
            );

            // without matchByLocalIdentifier, the entry's local identifier comes from another context
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelectionByParams({
                    filters: [
                        {
                            attributeFilter: {
                                displayForm: readableLabel,
                                attributeElements: { uris: FILTER_ELEMENTS },
                                negativeSelection: false,
                                localIdentifier: RESTRICTED_LOCAL_ID,
                            },
                        },
                    ],
                }),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            expect(
                selectFilterContextAttributeFilterByDisplayForm(readableLabel)(Tester.state())
                    ?.attributeFilter.attributeElements,
            ).toEqual({ uris: FILTER_ELEMENTS });
            expect(getRestrictedFilterElements()).toEqual({ uris: FIRST_ELEMENT });
        });
    });

    // Two filters share a readable label. The first is restricted through its parent, so the user sees
    // only the second one, which receives the entries that match by display form.
    describe("with a readable twin of a filter restricted through its parent", () => {
        const PARENT_LABEL = ReferenceMd.Department.Default.attribute.displayForm;
        const SHARED_LABEL = ReferenceMd.Product.Name.attribute.displayForm;
        const PARENT_LOCAL_ID = "restricted_parent";
        const CHILD_LOCAL_ID = "restricted_child";
        const TWIN_LOCAL_ID = "readable_twin";
        const childParents = [{ filterLocalIdentifier: PARENT_LOCAL_ID, over: { attributes: [] } }];
        const defaultFilterContext = createDefaultFilterContext(defaultDateFilterConfig, true);

        let Tester: DashboardTester;
        const preload = async (
            twins: FilterContextItem[],
            attributeFilterConfigs: IDashboardAttributeFilterConfig[] = [],
        ) => {
            const customizationFns: PrivateDashboardContext = {
                preloadedDashboard: {
                    ...dashboardWithDefaults,
                    attributeFilterConfigs,
                    filterContext: {
                        ...defaultFilterContext,
                        ref: idRef("twins", "filterContext"),
                        uri: "twins",
                        identifier: "twins",
                        filters: [
                            ...defaultFilterContext.filters,
                            {
                                attributeFilter: {
                                    displayForm: PARENT_LABEL,
                                    attributeElements: { uris: FIRST_ELEMENT },
                                    negativeSelection: false,
                                    localIdentifier: PARENT_LOCAL_ID,
                                },
                            },
                            ...twins,
                        ],
                    },
                },
            };
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                EmptyDashboardIdentifier,
                { customizationFns },
            );
            Tester.dispatch(
                unavailableObjectsActions.setUnavailableObjects([
                    { ref: PARENT_LABEL, type: "displayForm", reason: "forbidden" },
                ]),
            );
        };

        const getItem = (localId: string) => {
            const item = selectFilterContextAttributeFilterItemByLocalId(localId)(Tester.state());
            if (!item) {
                throw new Error(`The filter ${localId} is missing.`);
            }
            return item;
        };

        const listFilter = (
            localIdentifier: string,
            uris: string[],
            parents?: typeof childParents,
            displayForm = SHARED_LABEL,
        ) => ({
            attributeFilter: {
                displayForm,
                attributeElements: { uris },
                negativeSelection: false,
                localIdentifier,
                filterElementsBy: parents,
            },
        });
        const getElements = (localId: string) => {
            const item = getItem(localId);
            return isDashboardAttributeFilter(item) ? item.attributeFilter.attributeElements : undefined;
        };

        describe("as list filters", () => {
            beforeEach(async () => {
                await preload([
                    listFilter(CHILD_LOCAL_ID, FIRST_ELEMENT, childParents),
                    listFilter(TWIN_LOCAL_ID, FIRST_ELEMENT),
                ]);
            });

            it.each([false, true])(
                "should apply a stale entry to the readable twin (matchByLocalIdentifier: %s)",
                async (matchByLocalIdentifier) => {
                    await Tester.dispatchAndWaitFor(
                        changeFilterContextSelectionByParams({
                            filters: [listFilter("stale_local_id", FILTER_ELEMENTS)],
                            matchByLocalIdentifier,
                        }),
                        "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                    );

                    expect(getElements(TWIN_LOCAL_ID)).toEqual({ uris: FILTER_ELEMENTS });
                    expect(getElements(CHILD_LOCAL_ID)).toEqual({ uris: FIRST_ELEMENT });
                },
            );

            it("should drop an entry that addresses the restricted filter exactly", async () => {
                await Tester.dispatchAndWaitFor(
                    changeFilterContextSelectionByParams({
                        filters: [listFilter(CHILD_LOCAL_ID, FILTER_ELEMENTS)],
                        matchByLocalIdentifier: true,
                    }),
                    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                );

                expect(getElements(CHILD_LOCAL_ID)).toEqual({ uris: FIRST_ELEMENT });
                expect(getElements(TWIN_LOCAL_ID)).toEqual({ uris: FIRST_ELEMENT });
            });
        });

        describe("as text filters", () => {
            const textFilter = (
                localIdentifier: string,
                values: string[],
                parents?: typeof childParents,
            ) => ({
                arbitraryAttributeFilter: {
                    displayForm: SHARED_LABEL,
                    values,
                    negativeSelection: false,
                    localIdentifier,
                    filterElementsBy: parents,
                },
            });
            const getTextValues = (localId: string) => {
                const item = getItem(localId);
                return isDashboardArbitraryAttributeFilter(item)
                    ? item.arbitraryAttributeFilter.values
                    : undefined;
            };

            beforeEach(async () => {
                await preload([
                    textFilter(CHILD_LOCAL_ID, ["stored"], childParents),
                    textFilter(TWIN_LOCAL_ID, ["stored"]),
                ]);
            });

            it.each([
                ["a stale local identifier", "stale_local_id", true],
                ["a foreign local identifier naming the restricted filter", CHILD_LOCAL_ID, false],
            ])(
                "should apply an entry with %s to the readable twin",
                async (_, localId, matchByLocalIdentifier) => {
                    await Tester.dispatchAndWaitFor(
                        changeFilterContextSelectionByParams({
                            filters: [textFilter(localId, ["new"])],
                            matchByLocalIdentifier,
                        }),
                        "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                    );

                    expect(getTextValues(TWIN_LOCAL_ID)).toEqual(["new"]);
                    expect(getTextValues(CHILD_LOCAL_ID)).toEqual(["stored"]);
                },
            );

            it("should drop an entry that addresses the restricted filter exactly", async () => {
                await Tester.dispatchAndWaitFor(
                    changeFilterContextSelectionByParams({
                        filters: [textFilter(CHILD_LOCAL_ID, ["new"])],
                        matchByLocalIdentifier: true,
                    }),
                    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                );

                expect(getTextValues(CHILD_LOCAL_ID)).toEqual(["stored"]);
                expect(getTextValues(TWIN_LOCAL_ID)).toEqual(["stored"]);
            });

            // The entry's parent names the restricted filter here. It must not become the twin's parent,
            // which would restrict the twin.
            const expectTwinKeepsItsOwnParents = () => {
                expect(dashboardAttributeFilterItemFilterElementsBy(getItem(TWIN_LOCAL_ID))).toBeUndefined();
                expect(
                    selectRestrictedDashboardFilterLocalIdentifiers(Tester.state()).has(TWIN_LOCAL_ID),
                ).toBe(false);
            };

            it("should keep the readable twin's own parents when a text entry replaces it", async () => {
                await Tester.dispatchAndWaitFor(
                    changeFilterContextSelectionByParams({
                        filters: [textFilter("stale_local_id", ["new"], childParents)],
                    }),
                    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                );

                expect(getTextValues(TWIN_LOCAL_ID)).toEqual(["new"]);
                expectTwinKeepsItsOwnParents();
            });

            it("should keep the readable twin's own parents when a list entry replaces it", async () => {
                await Tester.dispatchAndWaitFor(
                    changeFilterContextSelectionByParams({
                        filters: [listFilter("stale_local_id", FILTER_ELEMENTS, childParents)],
                    }),
                    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                );

                expect(getElements(TWIN_LOCAL_ID)).toEqual({ uris: FILTER_ELEMENTS });
                expectTwinKeepsItsOwnParents();
            });
        });

        // the readable filter uses another attribute and shows the restricted filter's label instead
        describe("as a list filter shown through the label of the restricted one", () => {
            const OTHER_LABEL = ReferenceMd.Region.Default.attribute.displayForm;

            beforeEach(async () => {
                await preload(
                    [
                        listFilter(CHILD_LOCAL_ID, FIRST_ELEMENT, childParents),
                        listFilter(TWIN_LOCAL_ID, FIRST_ELEMENT, undefined, OTHER_LABEL),
                    ],
                    [{ localIdentifier: TWIN_LOCAL_ID, displayAsLabel: SHARED_LABEL }],
                );
            });

            it("should apply a stale entry to the readable filter", async () => {
                await Tester.dispatchAndWaitFor(
                    changeFilterContextSelectionByParams({
                        filters: [listFilter("stale_local_id", FILTER_ELEMENTS)],
                    }),
                    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                );

                expect(getElements(TWIN_LOCAL_ID)).toEqual({ uris: FILTER_ELEMENTS });
                expect(getElements(CHILD_LOCAL_ID)).toEqual({ uris: FIRST_ELEMENT });
            });
        });

        describe("as measure value filters", () => {
            const METRIC = idRef("metric", "measure");
            const measureValueFilter = (
                localIdentifier: string,
                value: number,
                restricted = false,
            ): IDashboardMeasureValueFilter => ({
                dashboardMeasureValueFilter: {
                    measure: METRIC,
                    localIdentifier,
                    conditions: [{ comparison: { operator: "GREATER_THAN", value } }],
                    dimensionality: restricted ? [PARENT_LABEL] : undefined,
                },
            });
            const getConditions = (localId: string) =>
                selectFilterContextMeasureValueFilters(Tester.state()).find(
                    (filter) => filter.dashboardMeasureValueFilter.localIdentifier === localId,
                )?.dashboardMeasureValueFilter.conditions;

            beforeEach(async () => {
                await preload([
                    measureValueFilter(CHILD_LOCAL_ID, 1, true),
                    measureValueFilter(TWIN_LOCAL_ID, 1),
                ]);
            });

            it.each([
                ["a stale local identifier", "stale_local_id", true],
                ["a foreign local identifier naming the restricted filter", CHILD_LOCAL_ID, false],
            ])(
                "should apply an entry with %s to the readable twin",
                async (_, localId, matchByLocalIdentifier) => {
                    await Tester.dispatchAndWaitFor(
                        changeFilterContextSelectionByParams({
                            filters: [measureValueFilter(localId, 2)],
                            matchByLocalIdentifier,
                        }),
                        "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                    );

                    expect(getConditions(TWIN_LOCAL_ID)).toEqual(
                        measureValueFilter(TWIN_LOCAL_ID, 2).dashboardMeasureValueFilter.conditions,
                    );
                    expect(getConditions(CHILD_LOCAL_ID)).toEqual(
                        measureValueFilter(CHILD_LOCAL_ID, 1).dashboardMeasureValueFilter.conditions,
                    );
                },
            );

            it("should drop an entry that addresses the restricted filter exactly", async () => {
                await Tester.dispatchAndWaitFor(
                    changeFilterContextSelectionByParams({
                        filters: [measureValueFilter(CHILD_LOCAL_ID, 2)],
                        matchByLocalIdentifier: true,
                    }),
                    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                );

                expect(getConditions(CHILD_LOCAL_ID)).toEqual(
                    measureValueFilter(CHILD_LOCAL_ID, 1).dashboardMeasureValueFilter.conditions,
                );
                expect(getConditions(TWIN_LOCAL_ID)).toEqual(
                    measureValueFilter(TWIN_LOCAL_ID, 1).dashboardMeasureValueFilter.conditions,
                );
            });
        });
    });
});
