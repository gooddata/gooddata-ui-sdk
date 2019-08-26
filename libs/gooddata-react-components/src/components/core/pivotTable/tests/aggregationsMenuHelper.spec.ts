// (C) 2019 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import aggregationsMenuHelper, { getUpdatedColumnTotals } from "../aggregationsMenuHelper";
import { IColumnTotal } from "../AggregationsMenu";
import { IMenuAggregationClickConfig } from "../../../../interfaces/PivotTable";
import { FIELD_TYPE_ATTRIBUTE, FIELD_TYPE_MEASURE } from "../agGridConst";

describe("aggregationsMenuHelper", () => {
    describe("getTotalsForMeasureHeader", () => {
        it("should return empty totals for measure when no total defined", () => {
            const measure = "m1";
            const totals: AFM.ITotalItem[] = [
                {
                    type: "sum",
                    measureIdentifier: "m2",
                    attributeIdentifier: "a1",
                },
            ];

            expect(aggregationsMenuHelper.getTotalsForMeasureHeader(totals, measure)).toEqual([]);
        });

        it("should return totals for measure when multiple totals defined", () => {
            const measure = "m1";
            const totals: AFM.ITotalItem[] = [
                {
                    type: "sum",
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                },
                {
                    type: "min",
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                },
            ];

            expect(aggregationsMenuHelper.getTotalsForMeasureHeader(totals, measure)).toEqual([
                {
                    type: "sum",
                    attributes: ["a1"],
                },
                {
                    type: "min",
                    attributes: ["a1"],
                },
            ]);
        });

        it("should return total for measure when total defined for multiple attributes", () => {
            const measure = "m1";
            const totals: AFM.ITotalItem[] = [
                {
                    type: "sum",
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                },
                {
                    type: "sum",
                    measureIdentifier: "m1",
                    attributeIdentifier: "a2",
                },
            ];

            expect(aggregationsMenuHelper.getTotalsForMeasureHeader(totals, measure)).toEqual([
                {
                    type: "sum",
                    attributes: ["a1", "a2"],
                },
            ]);
        });
    });

    describe("getTotalsForAttributeHeader", () => {
        it("should return empty totals when totals are not defined for all measures", () => {
            const measures = ["m1", "m2"];
            const totals: AFM.ITotalItem[] = [
                {
                    type: "sum",
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                },
                {
                    type: "min",
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                },
            ];

            expect(aggregationsMenuHelper.getTotalsForAttributeHeader(totals, measures)).toEqual([]);
        });

        it("should return empty totals when totals are defined for all measures but different attributes", () => {
            const measures = ["m1", "m2"];
            const totals: AFM.ITotalItem[] = [
                {
                    type: "sum",
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                },
                {
                    type: "sum",
                    measureIdentifier: "m2",
                    attributeIdentifier: "a2",
                },
            ];

            expect(aggregationsMenuHelper.getTotalsForAttributeHeader(totals, measures)).toEqual([]);
        });

        it("should return sum total when totals are defined for all measures and single attribute", () => {
            const measures = ["m1", "m2"];
            const totals: AFM.ITotalItem[] = [
                {
                    type: "sum",
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                },
                {
                    type: "sum",
                    measureIdentifier: "m2",
                    attributeIdentifier: "a1",
                },
            ];

            expect(aggregationsMenuHelper.getTotalsForAttributeHeader(totals, measures)).toEqual([
                {
                    type: "sum",
                    attributes: ["a1"],
                },
            ]);
        });

        it("should return sum, min totals when totals are defined for single measure", () => {
            const measures = ["m1"];
            const totals: AFM.ITotalItem[] = [
                {
                    type: "sum",
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                },
                {
                    type: "min",
                    measureIdentifier: "m1",
                    attributeIdentifier: "a2",
                },
            ];

            expect(aggregationsMenuHelper.getTotalsForAttributeHeader(totals, measures)).toEqual([
                {
                    type: "sum",
                    attributes: ["a1"],
                },
                {
                    type: "min",
                    attributes: ["a2"],
                },
            ]);
        });
    });

    describe("getHeaderMeasureLocalIdentifiers", () => {
        describe("attribute header", () => {
            const lastFieldType = FIELD_TYPE_ATTRIBUTE;
            const lastFieldId = "whatever";

            it("should return empty list when no measure header items provided", () => {
                const measureGroupHeaderItems: Execution.IMeasureHeaderItem[] = [];

                expect(
                    aggregationsMenuHelper.getHeaderMeasureLocalIdentifiers(
                        measureGroupHeaderItems,
                        lastFieldType,
                        lastFieldId,
                    ),
                ).toEqual([]);
            });

            it("should return measure identifiers when multiple measure headers provided", () => {
                const measureGroupHeaderItems: Execution.IMeasureHeaderItem[] = [
                    {
                        measureHeaderItem: {
                            localIdentifier: "foo",
                            name: "",
                            format: "",
                        },
                    },
                    {
                        measureHeaderItem: {
                            localIdentifier: "bar",
                            name: "",
                            format: "",
                        },
                    },
                ];

                expect(
                    aggregationsMenuHelper.getHeaderMeasureLocalIdentifiers(
                        measureGroupHeaderItems,
                        lastFieldType,
                        lastFieldId,
                    ),
                ).toEqual(["foo", "bar"]);
            });
        });

        describe("measure header", () => {
            const lastFieldType = FIELD_TYPE_MEASURE;
            const lastFieldId = 0;
            const measureGroupHeaderItems: Execution.IMeasureHeaderItem[] = [
                {
                    measureHeaderItem: {
                        localIdentifier: "foo",
                        name: "",
                        format: "",
                    },
                },
                {
                    measureHeaderItem: {
                        localIdentifier: "bar",
                        name: "",
                        format: "",
                    },
                },
            ];

            it("should throw error no measure header items provided", () => {
                expect(
                    aggregationsMenuHelper.getHeaderMeasureLocalIdentifiers.bind(
                        this,
                        [],
                        lastFieldType,
                        lastFieldId,
                    ),
                ).toThrowError();
            });

            it("should throw error when unknown field type provided", () => {
                expect(
                    aggregationsMenuHelper.getHeaderMeasureLocalIdentifiers.bind(
                        this,
                        measureGroupHeaderItems,
                        "X",
                        lastFieldId,
                    ),
                ).toThrowError();
            });

            it("should return first measure identifier when multiple measure headers provided", () => {
                expect(
                    aggregationsMenuHelper.getHeaderMeasureLocalIdentifiers(
                        measureGroupHeaderItems,
                        lastFieldType,
                        lastFieldId,
                    ),
                ).toEqual(["foo"]);
            });
        });
    });

    describe("isTotalEnabledForAttribute", () => {
        const columnTotals: IColumnTotal[] = [
            {
                type: "sum",
                attributes: ["a1", "a2"],
            },
            {
                type: "min",
                attributes: ["a3"],
            },
        ];

        it("should return false when there is no total defined", () => {
            const result = aggregationsMenuHelper.isTotalEnabledForAttribute("a1", "sum", []);
            expect(result).toBe(false);
        });

        it("should return false when there is different total defined for attribute", () => {
            const columnTotals: IColumnTotal[] = [
                {
                    type: "min",
                    attributes: ["a1", "a2"],
                },
            ];
            const result = aggregationsMenuHelper.isTotalEnabledForAttribute("a1", "sum", columnTotals);
            expect(result).toBe(false);
        });

        it("should return false when the provided total is not defined for an attribute", () => {
            const result = aggregationsMenuHelper.isTotalEnabledForAttribute("a1", "min", columnTotals);
            expect(result).toBe(false);
        });

        it("should return false when no total is not defined for an attribute", () => {
            const result = aggregationsMenuHelper.isTotalEnabledForAttribute("a4", "sum", columnTotals);
            expect(result).toBe(false);
        });

        it("should return true when the provided total is defined for an attribute", () => {
            const result = aggregationsMenuHelper.isTotalEnabledForAttribute("a1", "sum", columnTotals);
            expect(result).toBe(true);
        });
    });

    describe("getUpdatedColumnTotals", () => {
        it("should add grandtotal", () => {
            const columnTotals: AFM.ITotalItem[] = [];

            const menuAggregationClickConfig: IMenuAggregationClickConfig = {
                attributeIdentifier: "a1",
                include: true,
                measureIdentifiers: ["m1"],
                type: "sum",
            };

            const expectedColumns: AFM.ITotalItem[] = [
                { attributeIdentifier: "a1", measureIdentifier: "m1", type: "sum" },
            ];

            const result = getUpdatedColumnTotals(columnTotals, menuAggregationClickConfig);

            expect(result).toEqual(expectedColumns);
        });
        it("should add grandtotal for every measure", () => {
            const columnTotals: AFM.ITotalItem[] = [];

            const menuAggregationClickConfig: IMenuAggregationClickConfig = {
                attributeIdentifier: "a1",
                include: true,
                measureIdentifiers: ["m1", "m2"],
                type: "sum",
            };

            const expectedColumns: AFM.ITotalItem[] = [
                { attributeIdentifier: "a1", measureIdentifier: "m1", type: "sum" },
                { attributeIdentifier: "a1", measureIdentifier: "m2", type: "sum" },
            ];

            const result = getUpdatedColumnTotals(columnTotals, menuAggregationClickConfig);

            expect(result).toEqual(expectedColumns);
        });
        it("should remove grandtotal", () => {
            const columnTotals: AFM.ITotalItem[] = [
                { attributeIdentifier: "a1", measureIdentifier: "m1", type: "sum" },
            ];

            const menuAggregationClickConfig: IMenuAggregationClickConfig = {
                attributeIdentifier: "a1",
                include: false,
                measureIdentifiers: ["m1"],
                type: "sum",
            };

            const expectedColumns: AFM.ITotalItem[] = [];

            const result = getUpdatedColumnTotals(columnTotals, menuAggregationClickConfig);

            expect(result).toEqual(expectedColumns);
        });
        it("should remove grandtotal for every measure", () => {
            const columnTotals: AFM.ITotalItem[] = [
                { attributeIdentifier: "a1", measureIdentifier: "m1", type: "sum" },
                { attributeIdentifier: "a1", measureIdentifier: "m2", type: "sum" },
            ];

            const menuAggregationClickConfig: IMenuAggregationClickConfig = {
                attributeIdentifier: "a1",
                include: false,
                measureIdentifiers: ["m1", "m2"],
                type: "sum",
            };

            const expectedColumns: AFM.ITotalItem[] = [];

            const result = getUpdatedColumnTotals(columnTotals, menuAggregationClickConfig);

            expect(result).toEqual(expectedColumns);
        });
        it("should not remove other types of grandtotals", () => {
            const columnTotals: AFM.ITotalItem[] = [
                { attributeIdentifier: "a1", measureIdentifier: "m1", type: "sum" },
                { attributeIdentifier: "a1", measureIdentifier: "m1", type: "avg" },
            ];

            const menuAggregationClickConfig: IMenuAggregationClickConfig = {
                attributeIdentifier: "a1",
                include: false,
                measureIdentifiers: ["m1"],
                type: "sum",
            };

            const expectedColumns: AFM.ITotalItem[] = [
                { attributeIdentifier: "a1", measureIdentifier: "m1", type: "avg" },
            ];

            const result = getUpdatedColumnTotals(columnTotals, menuAggregationClickConfig);

            expect(result).toEqual(expectedColumns);
        });
        it("should not remove grandtotals of different measure", () => {
            const columnTotals: AFM.ITotalItem[] = [
                { attributeIdentifier: "a1", measureIdentifier: "m1", type: "sum" },
                { attributeIdentifier: "a1", measureIdentifier: "m2", type: "sum" },
            ];

            const menuAggregationClickConfig: IMenuAggregationClickConfig = {
                attributeIdentifier: "a1",
                include: false,
                measureIdentifiers: ["m1"],
                type: "sum",
            };

            const expectedColumns: AFM.ITotalItem[] = [
                { attributeIdentifier: "a1", measureIdentifier: "m2", type: "sum" },
            ];

            const result = getUpdatedColumnTotals(columnTotals, menuAggregationClickConfig);

            expect(result).toEqual(expectedColumns);
        });
        it("should add subtotal", () => {
            const columnTotals: AFM.ITotalItem[] = [];

            const menuAggregationClickConfig: IMenuAggregationClickConfig = {
                attributeIdentifier: "a2",
                include: true,
                measureIdentifiers: ["m1"],
                type: "sum",
            };

            const expectedColumns: AFM.ITotalItem[] = [
                { attributeIdentifier: "a2", measureIdentifier: "m1", type: "sum" },
            ];

            const result = getUpdatedColumnTotals(columnTotals, menuAggregationClickConfig);

            expect(result).toEqual(expectedColumns);
        });
        it("should not remove subtotals of same type when removing grandtotal", () => {
            const columnTotals: AFM.ITotalItem[] = [
                { attributeIdentifier: "a2", measureIdentifier: "m1", type: "sum" },
                { attributeIdentifier: "a3", measureIdentifier: "m1", type: "sum" },
            ];

            const menuAggregationClickConfig: IMenuAggregationClickConfig = {
                attributeIdentifier: "a1",
                include: false,
                measureIdentifiers: ["m1"],
                type: "sum",
            };

            const expectedColumns: AFM.ITotalItem[] = [
                { attributeIdentifier: "a2", measureIdentifier: "m1", type: "sum" },
                { attributeIdentifier: "a3", measureIdentifier: "m1", type: "sum" },
            ];

            const result = getUpdatedColumnTotals(columnTotals, menuAggregationClickConfig);

            expect(result).toEqual(expectedColumns);
        });
    });
});
