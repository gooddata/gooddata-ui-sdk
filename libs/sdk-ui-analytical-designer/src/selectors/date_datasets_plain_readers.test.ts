// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import { MEASURES, VIEW } from "../constants/bucket.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { initialCatalogState } from "../store/catalog/catalog_reducer.js";
import { defaultFilterBarState } from "../store/filter_bar/filter_bar_state.js";
import { type IFilter } from "../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../store/types.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { visualizationClassMock } from "../tests/visualization_class.test.helpers.js";
import { type IDateDataset } from "../typings/datasets.js";

import { currentReportMDObject } from "./buckets_selector.js";
import { getDrillDowns } from "./drill_down_selectors.js";
import { bucketsAddItem } from "./test_helpers.js";

/**
 * Both readers below must resolve their entries end-to-end THROUGH the domain accessor
 * (`getPlainDateDatasets`), not by reaching into the container themselves.
 */
describe("plain dateDatasets container readers", () => {
    const DATE_DATASET_REF = uriRef("/gdc/md/x/obj/1");
    const DF_REF = idRef("activity.date.dim_date");

    const availableDateDataset: IDateDataset = {
        id: "date.activity",
        identifier: "date.activity",
        isAvailable: true,
        relevance: 0,
        summary: "",
        type: "dateDataset",
        ref: DATE_DATASET_REF,
        title: "Activity",
        uri: "/gdc/md/x/obj/1",
        attributes: [
            {
                ref: uriRef("/gdc/md/x/obj/2"),
                dateType: "GDC.time.year",
                dfRef: DF_REF,
                dfIdentifier: "activity.date.dim_date",
                dfUri: "/gdc/md/x/obj/3",
                uri: "/gdc/md/x/obj/2",
                title: "Year (Activity)",
                granularity: "activity.year",
                displayForms: [],
            },
        ],
    };

    const DATE_HIERARCHY = {
        type: "dateAttributeHierarchy" as const,
        ref: uriRef("/gdc/md/x/obj/3"),
        dateDatasetRef: DATE_DATASET_REF,
        attributes: [uriRef("/gdc/md/x/obj/2")],
        title: "Date hierarchy",
        templateId: "default",
    };

    function stateWithAvailableDateDatasets(): IAppState {
        return withData(getInitializedState(), {
            dateDatasets: {
                ...getInitializedState().data.dateDatasets,
                available: [availableDateDataset] as unknown as IDateDataset[],
            },
        });
    }

    it("getDrillDowns resolves a date bucket item instead of throwing on the container", () => {
        let state = withData(
            withData(
                withData(
                    withData(stateWithAvailableDateDatasets(), {
                        dateDatasets: {
                            ...stateWithAvailableDateDatasets().data.dateDatasets,
                            allItems: [availableDateDataset] as unknown as IDateDataset[],
                        },
                    }),
                    { visualizationClass: visualizationClassMock("local:bar") },
                ),
                {
                    buckets: [
                        { localIdentifier: MEASURES, items: [] },
                        { localIdentifier: VIEW, items: [] },
                    ],
                },
            ),
            { catalog: { ...initialCatalogState, dateHierarchies: [DATE_HIERARCHY] } },
        );
        state = bucketsAddItem(state, VIEW, {
            // the sentinel a real date bucket item carries: it makes getAttribute decorate through
            // createDateItem(), whose GRANULARITY.YEAR is what selects the dataset's year attribute
            attribute: DATE_DATASET_ATTRIBUTE,
            type: "date",
            granularity: "GDC.time.year",
            dateDatasetRef: DATE_DATASET_REF,
            localIdentifier: "d1",
        });

        // asserting the resolved entry rather than only `not.toThrow()` is what makes this a guard
        // for the SILENT variant too: an entry the reader cannot resolve yields an attribute with
        // no `ref`, which then matches no hierarchy and drops out of the result.
        expect(getDrillDowns(state)).toEqual([
            {
                bucketItem: { localIdentifier: "d1", type: "date", title: "Year (Activity)" },
                attributeHierarchies: [DATE_HIERARCHY],
            },
        ]);
    });

    it("currentReportMDObject still emits the empty-date-values attribute filter", () => {
        const state = withData(
            withData(
                withData(stateWithAvailableDateDatasets(), {
                    visualizationClass: visualizationClassMock("local:bar"),
                }),
                { buckets: [{ localIdentifier: MEASURES, items: [] }] },
            ),
            {
                filterBar: {
                    ...defaultFilterBarState,
                    items: [
                        {
                            type: "date",
                            localIdentifier: "f1",
                            dateDatasetRef: DATE_DATASET_REF,
                            cacheItemIdentifier: "date.activity",
                            emptyDateValuesFilter: "only",
                            filterConfig: {
                                granularity: "GDC.time.year",
                                interval: [-1, 0],
                                type: "relative",
                            },
                        } as IFilter,
                    ],
                },
            },
        );

        const filters = currentReportMDObject(state).filters;

        // the "only" mode must resolve the date attribute's display form through the `available`
        // items — an unresolved display form silently drops the filter from the MD object
        expect(filters).toContainEqual({
            positiveAttributeFilter: {
                displayForm: DF_REF,
                in: [""],
            },
        });
    });
});
