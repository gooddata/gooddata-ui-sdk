// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { setDateDatasetsMeta } from "../../actions/data_actions.js";
import { type IDateDatasetsMeta } from "../../models/date_datasets_meta.js";
import { type IDateDatasetsMetaItem } from "../../models/date_datasets_meta_item.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { type IDateDatasetAttribute } from "../../typings/dataset_attribute.js";

import {
    getDateAttributes,
    getDateDatasetUriByIdentifier,
    getDateDatasetsMeta,
    getDateDatasetsMetaItems,
    getDateDatasetsMetaState,
} from "./date_datasets_meta_selectors.js";
import { dateDatasetsMetaInitialState } from "./date_datasets_meta_state.js";

// the itemCache side effect of the same action is covered by store/item_cache/test
describe("dateDatasetsMeta store", () => {
    const items: IDateDatasetsMetaItem[] = [
        {
            identifier: "activity.dataset.dt",
            uri: "/gdc/md/TeamOneGoodSales1/obj/727",
            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/727"),
            type: "dateDataset",
            title: "Date (Activity)",
            summary: "DataSet Date",
            attributes: [],
        },
    ];
    const dateDatasetsMeta: IDateDatasetsMeta = { items: [...items] };

    const closedMeta: IDateDatasetsMeta = {
        items: [
            {
                identifier: "closed.dataset.dt",
                uri: "/gdc/md/TeamOneGoodSales1/obj/720",
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/720"),
                type: "dateDataset",
                title: "Date (closed)",
                summary: "DataSet Date",
                attributes: [],
            },
        ],
    };

    const store = (state = getInitializedState(), meta = dateDatasetsMeta) =>
        combinedRootReducer(state, setDateDatasetsMeta(meta));

    it("self-initializes to empty items on the first action", () => {
        const state = combinedRootReducer(initialState, { type: "@@INIT" });

        expect(getDateDatasetsMetaState(state)).toEqual({ items: [] });
    });

    it("returns the initial state through the selector before the slice ever reduced", () => {
        expect(getDateDatasetsMetaState(initialState)).toBe(dateDatasetsMetaInitialState);
        expect(getDateDatasetsMeta(initialState)).toEqual({ items: [] });
        expect(getDateDatasetsMetaItems(initialState)).toEqual([]);
    });

    it("stores the meta payload verbatim as a plain leaf", () => {
        const state = store();

        expect(getDateDatasetsMeta(state)).toEqual(dateDatasetsMeta);
        expect(getDateDatasetsMetaItems(state)).toEqual(items);
    });

    it("replaces the previously stored meta", () => {
        const state = store(store(), closedMeta);

        expect(getDateDatasetsMeta(state)).toEqual(closedMeta);
    });

    it("keeps the root reference on unrelated actions (identity short-circuit)", () => {
        const state = getInitializedState();

        expect(combinedRootReducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });

    describe("getDateDatasetUriByIdentifier", () => {
        it("returns the uri of a stored date dataset", () => {
            expect(getDateDatasetUriByIdentifier(store(), "activity.dataset.dt")).toBe(
                "/gdc/md/TeamOneGoodSales1/obj/727",
            );
        });

        it("returns undefined for an unknown identifier", () => {
            expect(getDateDatasetUriByIdentifier(store(), "closed.dataset.dt")).toBeUndefined();
        });
    });

    describe("getDateAttributes", () => {
        it("flattens the granularity attributes of every dataset", () => {
            const withAttributes: IDateDatasetsMeta = {
                items: [
                    { ...items[0], attributes: [{ granularity: "activity.year" } as IDateDatasetAttribute] },
                    {
                        ...closedMeta.items[0],
                        attributes: [{ granularity: "closed.year" } as IDateDatasetAttribute],
                    },
                ],
            };

            expect(getDateAttributes(store(getInitializedState(), withAttributes))).toEqual([
                { granularity: "activity.year" },
                { granularity: "closed.year" },
            ]);
        });
    });

    describe("reading a subtree patched outside the slice", () => {
        it("resolves items written straight into the subtree", () => {
            const state = withData(getInitializedState(), {
                dateDatasetsMeta: { ...getInitializedState().data.dateDatasetsMeta, items: items },
            });

            expect(getDateDatasetsMetaItems(state)).toEqual(items);
        });
    });
});
