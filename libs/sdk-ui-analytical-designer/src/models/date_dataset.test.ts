// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { dateDatasetsAvailable } from "../tests/constants.test.helpers.js";
import { type IDateDataset } from "../typings/datasets.js";

import {
    type IDecoratedDateDatasetItem,
    type IDecoratedDateDatasets,
    decoratedDateDataset,
    decoratedDateDatasetMeta,
    decoratedDateDatasets,
} from "./date_dataset.js";
import { type IDateDatasetsMetaItem } from "./date_datasets_meta_item.js";
describe("Decorated DateDataset", () => {
    let dateDataset: IDateDataset;

    const dateDatasetMetaItem: IDateDatasetsMetaItem = {
        identifier: "date.dataset.meta",
        title: "Date Dataset Meta",
        summary: "",
        uri: "/gdc/md/DateDatasetMeta/1",
        ref: uriRef("/gdc/md/DateDatasetMeta/1"),
        type: "",
        attributes: [],
    };

    beforeEach(() => {
        dateDataset = {
            attributes: [
                {
                    dateType: "GDC.time.week_us",
                    dfIdentifier: "date.aa281lMifn6q",
                    dfUri: "/gdc/md/TeamOneGoodSales1/obj/15259",
                    granularity: "date.euweek",
                    title: "Week/Year (Date)",
                    uri: "/gdc/md/TeamOneGoodSales1/obj/15254",
                    ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15254"),
                    dfRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/15259"),
                    displayForms: [],
                },
                {
                    dateType: "GDC.time.date",
                    dfIdentifier: "date.date.mmddyyyy",
                    dfUri: "/gdc/md/TeamOneGoodSales1/obj/15203",
                    granularity: "date.date",
                    title: "Date (Date)",
                    uri: "/gdc/md/TeamOneGoodSales1/obj/15200",
                    ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15200"),
                    dfRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/15203"),
                    displayForms: [],
                },
                {
                    dateType: "GDC.time.month_in_quarter",
                    dfIdentifier: "created.aby81lMifn6q",
                    dfUri: "/gdc/md/TeamOneGoodSales1/obj/15208",
                    granularity: "GDC.time.month_in_quarter",
                    title: "Date (Month in Quarter)",
                    uri: "/gdc/md/TeamOneGoodSales1/obj/15208",
                    ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15208"),
                    dfRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/15208"),
                    displayForms: [],
                },
            ],
            id: "date.dim_date",
            identifier: "date.dim_date",
            isAvailable: true,
            relevance: 0,
            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15174"),
            summary: "Date dimension (Date)",
            title: "Date dimension (Date)",
            type: "dimension",
            uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
        };
    });

    describe("date dataset", () => {
        let decorated: IDecoratedDateDatasetItem;

        beforeEach(() => {
            decorated = decoratedDateDataset(dateDataset);
        });

        it("attributeTitle should be correctly set", () => {
            expect(decorated.attributeTitle).toEqual("Date dimension (Date)");
        });

        it("isDisabled should be correctly set", () => {
            expect(decorated.isDisabled).toEqual(false);

            decorated = decoratedDateDataset({ ...dateDataset, isAvailable: false });

            expect(decorated.isDisabled).toEqual(true);
        });

        it("attributes should be correctly set", () => {
            expect(decorated.attributes.length).toEqual(3);
            expect(decorated.attributes[0]).toMatchSnapshot();
            expect(decorated.attributes[1]).toMatchSnapshot();
            expect(decorated.attributes[2]).toMatchSnapshot();
        });
    });

    describe("date datasets", () => {
        let dateDatasets: Parameters<typeof decoratedDateDatasets>[0];
        let decorated: IDecoratedDateDatasets;

        beforeEach(() => {
            dateDatasets = {
                available: [dateDataset],
                used: [dateDatasetsAvailable[0]],
                unavailable: 1,
            };

            decorated = decoratedDateDatasets(dateDatasets);
        });

        it("should set items to concatenation of available and used dateDatasets", () => {
            expect(decorated.items.length).toEqual(2);
        });

        it("should set isAvailable", () => {
            expect(decorated.items[0].isAvailable).toEqual(true);
        });

        it("should decorate absent item lists to no items instead of throwing", () => {
            const absent = decoratedDateDatasets({ available: undefined, used: undefined });

            expect(absent.items).toEqual([]);
            // the `{used}` currency carries no count — the declared `number` defaults to 0
            expect(absent.unavailable).toBe(0);
        });
    });

    describe("date dataset meta", () => {
        const decorated = decoratedDateDatasetMeta(dateDatasetMetaItem);

        it('should set "attributeTitle"', () => {
            expect(decorated.attributeTitle).toEqual(dateDatasetMetaItem.title);
        });
    });
});
