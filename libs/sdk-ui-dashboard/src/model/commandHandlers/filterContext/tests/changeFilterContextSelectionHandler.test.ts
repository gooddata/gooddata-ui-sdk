// (C) 2023-2024 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import {
    addAttributeFilter,
    changeFilterContextSelection,
    removeAttributeFilter,
} from "../../../commands/index.js";
import { selectFilterContextAttributeFilters } from "../../../store/index.js";
import { EmptyDashboardIdentifier } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { DashboardAttributeFilterSelectionMode, IAttributeElementsByRef, ObjRef } from "@gooddata/sdk-model";

describe("change filter context selection handler", () => {
    const FILTER_ELEMENTS = ["element1", "element2", "element3"];
    const FIRST_ELEMENT = [FILTER_ELEMENTS[0]];

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
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, EmptyDashboardIdentifier);
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
        2;
        describe("backend supportsElementUris", () => {
            let Tester: DashboardTester;
            beforeEach(async () => {
                await preloadedTesterFactory(async (tester) => {
                    Tester = tester;
                    await addFilter(Tester, DASHBOARD_FILTER_DISPLAY_FORM);
                    await changeFilterSelection(Tester, {
                        displayForm: DASHBOARD_FILTER_DISPLAY_FORM,
                        negativeSelection: false,
                        elements: FIRST_ELEMENT,
                    });
                }, EmptyDashboardIdentifier);
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
});
