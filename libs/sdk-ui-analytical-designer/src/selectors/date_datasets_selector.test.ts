// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IAttribute, type IAttributeOrMeasure, newAttribute } from "@gooddata/sdk-model";

import { reduceInsightWithoutAllDates, reduceInsightWithoutExpandedDate } from "./date_datasets_selector.js";

describe("date datasets selector test", () => {
    describe("reduceInsightWithoutAllDates", () => {
        it("should not add date attribute", () => {
            const accWithAttributes: IAttributeOrMeasure[] = [newAttribute("a1"), newAttribute("a2")];
            const curDate: IAttribute = newAttribute("d1", (m) => m.localId("d1"));
            const dateBucketItemsLocalIds = ["d1", "d2"];
            const datesReferencedByMvf: string[] = [];

            expect(
                reduceInsightWithoutAllDates(
                    accWithAttributes,
                    curDate,
                    dateBucketItemsLocalIds,
                    datesReferencedByMvf,
                ),
            ).toEqual(accWithAttributes);
        });

        it("should add attribute", () => {
            const accWithAttributes: IAttributeOrMeasure[] = [newAttribute("a1"), newAttribute("a2")];
            const curAttribute: IAttribute = newAttribute("a3", (m) => m.localId("a3"));
            const dateBucketItemsLocalIds = ["d1", "d2"];
            const datesReferencedByMvf: string[] = [];
            const expectedAcc: IAttributeOrMeasure[] = [...accWithAttributes, curAttribute];

            expect(
                reduceInsightWithoutAllDates(
                    accWithAttributes,
                    curAttribute,
                    dateBucketItemsLocalIds,
                    datesReferencedByMvf,
                ),
            ).toEqual(expectedAcc);
        });

        it("should keep date attribute if referenced by MVF dimensionality", () => {
            const accWithAttributes: IAttributeOrMeasure[] = [newAttribute("a1"), newAttribute("a2")];
            const curDate: IAttribute = newAttribute("d1", (m) => m.localId("d1"));
            const dateBucketItemsLocalIds = ["d1", "d2"];
            const datesReferencedByMvf = ["d1"]; // d1 is referenced by MVF
            const expectedAcc: IAttributeOrMeasure[] = [...accWithAttributes, curDate];

            expect(
                reduceInsightWithoutAllDates(
                    accWithAttributes,
                    curDate,
                    dateBucketItemsLocalIds,
                    datesReferencedByMvf,
                ),
            ).toEqual(expectedAcc);
        });
    });

    describe("reduceInsightWithoutExpandedDate", () => {
        it("should add date attribute if date is not expanded", () => {
            const accWithAttributes: IAttributeOrMeasure[] = [newAttribute("a1"), newAttribute("a2")];
            const curDate: IAttribute = newAttribute("d1", (m) => m.localId("d1"));
            const dateBucketItemsLocalIds = ["d1", "d2"];
            const filteredDateBucketItemsLocalIds = ["d1"];
            const datesReferencedByMvf: string[] = [];
            const expectedAcc: IAttributeOrMeasure[] = [...accWithAttributes, curDate];

            expect(
                reduceInsightWithoutExpandedDate(
                    accWithAttributes,
                    curDate,
                    dateBucketItemsLocalIds,
                    filteredDateBucketItemsLocalIds,
                    datesReferencedByMvf,
                ),
            ).toEqual(expectedAcc);
        });

        it("should not add date attribute if date is expanded", () => {
            const accWithAttributes: IAttributeOrMeasure[] = [newAttribute("a1"), newAttribute("a2")];
            const curDate: IAttribute = newAttribute("d1", (m) => m.localId("d1"));
            const dateBucketItemsLocalIds = ["d1", "d2"];
            const filteredDateBucketItemsLocalIds = ["d2"];
            const datesReferencedByMvf: string[] = [];

            expect(
                reduceInsightWithoutExpandedDate(
                    accWithAttributes,
                    curDate,
                    dateBucketItemsLocalIds,
                    filteredDateBucketItemsLocalIds,
                    datesReferencedByMvf,
                ),
            ).toEqual(accWithAttributes);
        });

        it("should keep expanded date attribute if referenced by MVF dimensionality", () => {
            const accWithAttributes: IAttributeOrMeasure[] = [newAttribute("a1"), newAttribute("a2")];
            const curDate: IAttribute = newAttribute("d1", (m) => m.localId("d1"));
            const dateBucketItemsLocalIds = ["d1", "d2"];
            const filteredDateBucketItemsLocalIds = ["d2"]; // d1 is expanded (filtered out)
            const datesReferencedByMvf = ["d1"]; // but d1 is referenced by MVF
            const expectedAcc: IAttributeOrMeasure[] = [...accWithAttributes, curDate];

            expect(
                reduceInsightWithoutExpandedDate(
                    accWithAttributes,
                    curDate,
                    dateBucketItemsLocalIds,
                    filteredDateBucketItemsLocalIds,
                    datesReferencedByMvf,
                ),
            ).toEqual(expectedAcc);
        });

        it("should add attribute", () => {
            const accWithAttributes: IAttributeOrMeasure[] = [newAttribute("a1"), newAttribute("a2")];
            const curAttribute: IAttribute = newAttribute("a3", (m) => m.localId("a3"));
            const dateBucketItemsLocalIds = ["d1", "d2"];
            const filteredDateBucketItemsLocalIds = ["d2"];
            const datesReferencedByMvf: string[] = [];
            const expectedAcc: IAttributeOrMeasure[] = [...accWithAttributes, curAttribute];

            expect(
                reduceInsightWithoutExpandedDate(
                    accWithAttributes,
                    curAttribute,
                    dateBucketItemsLocalIds,
                    filteredDateBucketItemsLocalIds,
                    datesReferencedByMvf,
                ),
            ).toEqual(expectedAcc);
        });
    });
});
