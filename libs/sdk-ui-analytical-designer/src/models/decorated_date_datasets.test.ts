// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { type IDateDataset, type IDateDatasets } from "../typings/datasets.js";

import { DecoratedDateDatasets, type IDecoratedDateDatasets } from "./decorated_date_datasets.js";

describe("DecoratedDateDatasets", () => {
    const dateDataset = {
        identifier: "date.created",
        title: "Date (Created)",
        relevance: 10,
        ref: {
            uri: "gdc/md/date-created",
        },
    } as unknown as IDateDataset;

    describe("createFromDateDatasets", () => {
        it("should create object from valid dateDatasets", () => {
            const dateDatasets = DecoratedDateDatasets.createFromDateDatasets({
                available: [dateDataset],
                unavailable: 2,
            } as IDateDatasets);

            const expectedDateDatasets: IDecoratedDateDatasets = {
                items: [
                    {
                        identifier: "date.created",
                        title: "Date (Created)",
                        relevance: 10,
                        ref: {
                            uri: "gdc/md/date-created",
                        },
                    },
                ],
                unavailable: 2,
            };

            expect(dateDatasets).toEqual(expectedDateDatasets);
        });

        it("should create object when dateDatasets is empty", () => {
            const dateDatasets = DecoratedDateDatasets.createFromDateDatasets({
                available: [],
                unavailable: 0,
            });

            const expectedDateDatasets: IDecoratedDateDatasets = {
                items: [],
                unavailable: 0,
            };

            expect(dateDatasets).toEqual(expectedDateDatasets);
        });

        it("should decorate allItems when unavailable-items visibility is on", () => {
            const dateDatasets = DecoratedDateDatasets.createFromDateDatasets(
                {
                    available: [],
                    allItems: [dateDataset],
                    unavailable: 1,
                } as IDateDatasets,
                true,
            );

            expect(dateDatasets.items.map((item) => item.identifier)).toEqual(["date.created"]);
        });

        it("should decorate an absent allItems list to no items instead of throwing", () => {
            const dateDatasets = DecoratedDateDatasets.createFromDateDatasets(
                {
                    available: [dateDataset],
                    allItems: undefined,
                    unavailable: 0,
                } as IDateDatasets,
                true,
            );

            expect(dateDatasets.items).toEqual([]);
        });
    });
});
