// (C) 2023-2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    type DashboardAttributeFilterSelectionMode,
    type IAttributeElementsByRef,
    type IDashboard,
    type IDashboardAttributeFilter,
    type ObjRef,
    dashboardAttributeFilterItemLocalIdentifier,
    idRef,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";

import { createDefaultFilterContext } from "../../../_staging/dashboard/defaultFilterContext.js";
import { defaultDateFilterConfig } from "../../../_staging/dateFilterConfig/defaultConfig.js";
import {
    addAttributeFilter,
    addTextAttributeFilter,
    changeFilterContextSelection,
    changeFilterContextSelectionByParams,
    removeAttributeFilter,
} from "../../commands/filters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { EmptyDashboardIdentifier, EmptyDashboardWithReferences } from "../../fixtures/Dashboard.fixtures.js";
import {
    selectFilterContextAttributeFilterItemByDisplayForm,
    selectFilterContextAttributeFilterItemByLocalId,
    selectFilterContextAttributeFilters,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
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
});
