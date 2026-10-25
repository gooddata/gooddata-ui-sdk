// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { closedDateDatasetRef } from "../tests/constants.test.helpers.js";

import { DecoratedDateDataset, type IDecoratedDateDataset } from "./decorated_date_dataset.js";

describe("DecoratedDateDataset", () => {
    describe("createFromDecorated", () => {
        it("should create object from valid decorated dateDataset", () => {
            const dateDataset = DecoratedDateDataset.createFromDecorated({
                identifier: "date.created",
                attributeTitle: "Created",
                relevance: 10,
                ref: {
                    uri: "gdc/md/date-created",
                },
            });

            const expectedDateDataset: IDecoratedDateDataset = {
                identifier: "date.created",
                title: "Created",
                relevance: 10,
                ref: {
                    uri: "gdc/md/date-created",
                },
            };

            expect(dateDataset).toEqual(expectedDateDataset);
        });
    });

    describe("createDecorated", () => {
        it("should create object from mutable dateDataset", () => {
            const dateDataset = DecoratedDateDataset.createDecorated(closedDateDatasetRef);

            const expectedDateDataset: IDecoratedDateDataset = {
                identifier: "attr.datedataset.closed",
                isAvailable: true,
                title: "Week/Year (Closed)",
                relevance: 4,
                ref: {
                    uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.closed",
                },
            };

            expect(dateDataset).toEqual(expectedDateDataset);
        });
    });
});
