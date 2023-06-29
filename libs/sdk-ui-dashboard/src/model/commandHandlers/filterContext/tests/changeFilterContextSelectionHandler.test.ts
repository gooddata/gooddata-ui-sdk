// (C) 2023 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import {
    addAttributeFilter,
    changeFilterContextSelection,
    removeAttributeFilter,
} from "../../../commands/index.js";
import { selectFilterContextAttributeFilters } from "../../../store/index.js";
import { EmptyDashboardIdentifier } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { IAttributeElementsByRef } from "@gooddata/sdk-model";

describe("change filter context selection handler", () => {
    describe("single select filter", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, EmptyDashboardIdentifier);
        });

        const FILTER_ELEMENTS = ["element1", "element2", "element3"];
        const FIRST_ELEMENT = [FILTER_ELEMENTS[0]];

        const getFilters = () => {
            const filters = selectFilterContextAttributeFilters(Tester.state());
            const elements = filters.map(
                (filter) => filter.attributeFilter.attributeElements as IAttributeElementsByRef,
            );
            return {
                filters,
                elements,
            };
        };

        const addFilter = async (selection: "single" | "multi") => {
            await Tester.dispatchAndWaitFor(
                addAttributeFilter({ uri: "/gdc/md/referenceworkspace/obj/1089" }, 0, undefined, selection),
                "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADD",
            );
        };

        const removeFilter = async () => {
            const filters = selectFilterContextAttributeFilters(Tester.state());
            await Tester.dispatchAndWaitFor(
                removeAttributeFilter(filters[0].attributeFilter.localIdentifier!),
                "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVE",
            );
        };

        it("should cast positive multi select filter into single select", async () => {
            await addFilter("single");
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelection([
                    {
                        attributeFilter: {
                            displayForm: {
                                uri: "/gdc/md/referenceworkspace/obj/1089",
                            },
                            negativeSelection: false,
                            attributeElements: {
                                uris: FILTER_ELEMENTS,
                            },
                        },
                    },
                ]),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const { filters, elements } = getFilters();

            expect(elements[0].uris).toEqual(FIRST_ELEMENT);
            expect(filters[0].attributeFilter.negativeSelection).toEqual(false);
            expect(filters[0].attributeFilter.selectionMode).toEqual("single");

            await removeFilter();
        });

        it("should cast negative multi select filter into single select", async () => {
            await addFilter("single");
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelection([
                    {
                        attributeFilter: {
                            displayForm: {
                                uri: "/gdc/md/referenceworkspace/obj/1089",
                            },
                            negativeSelection: true,
                            attributeElements: {
                                uris: FILTER_ELEMENTS,
                            },
                        },
                    },
                ]),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const { filters, elements } = getFilters();

            expect(elements[0].uris).toEqual([]);
            expect(filters[0].attributeFilter.negativeSelection).toEqual(false);
            expect(filters[0].attributeFilter.selectionMode).toEqual("single");

            await removeFilter();
        });

        it("should cast multi select filter with one value into single select", async () => {
            await addFilter("single");
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelection([
                    {
                        attributeFilter: {
                            displayForm: {
                                uri: "/gdc/md/referenceworkspace/obj/1089",
                            },
                            negativeSelection: false,
                            attributeElements: {
                                uris: FIRST_ELEMENT,
                            },
                        },
                    },
                ]),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const { filters, elements } = getFilters();

            expect(elements[0].uris).toEqual(FIRST_ELEMENT);
            expect(filters[0].attributeFilter.negativeSelection).toEqual(false);
            expect(filters[0].attributeFilter.selectionMode).toEqual("single");

            await removeFilter();
        });

        it("should cast single select filter into multi select", async () => {
            await addFilter("multi");
            await Tester.dispatchAndWaitFor(
                changeFilterContextSelection([
                    {
                        attributeFilter: {
                            displayForm: {
                                uri: "/gdc/md/referenceworkspace/obj/1089",
                            },
                            negativeSelection: false,
                            attributeElements: {
                                uris: FIRST_ELEMENT,
                            },
                            selectionMode: "single",
                        },
                    },
                ]),
                "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            );

            const { filters, elements } = getFilters();

            expect(elements[0].uris).toEqual(FIRST_ELEMENT);
            expect(filters[0].attributeFilter.negativeSelection).toEqual(false);
            expect(filters[0].attributeFilter.selectionMode).toEqual("multi");

            await removeFilter();
        });
    });
});
