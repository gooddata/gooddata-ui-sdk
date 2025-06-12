// (C) 2007-2018 GoodData Corporation
import {
    parseValue,
    immutableSet,
    repeatItemsNTimes,
    unEscapeAngleBrackets,
    formatLegendLabel,
    getPrimaryChartType,
    unwrap,
    percentFormatter,
    getAxesCounts,
} from "../common.js";
import { describe, it, expect } from "vitest";

describe("Common utils", () => {
    describe("parseValue", () => {
        it("should parse string to float", () => {
            expect(parseValue("12345")).toEqual(12345);
            expect(parseValue("1.2345")).toEqual(1.2345);
            expect(parseValue("1.2345678901e-05")).toEqual(0.000012345678901);
        });

        it("should return null when value is string", () => {
            expect(parseValue("test")).toEqual(null);
        });
    });

    describe("immutableSet", () => {
        const data: any = {
            array: [
                {
                    modified: [1],
                    untouched: {},
                },
                { untouched: 3 },
            ],
        };
        const path = "array[0].modified[1]";
        const newValue = 4;

        const updated: any = immutableSet(data, path, newValue);
        it("should set values deep in the object hierarchy", () => {
            expect(updated.array[0].modified[1]).toEqual(4);
        });
        it("should clone objects that have been updated", () => {
            expect(updated.array[0].modified).not.toBe(data.array[0].modified);
        });
        it("should not clone objects that have NOT been updated", () => {
            expect(updated.array[1]).toBe(data.array[1]);
        });
    });

    describe("repeatItemsNTimes", () => {
        const array = [1, 2, 3];
        const n = 3;

        const repeatedArray = repeatItemsNTimes(array, n);
        it("should return a new array with original items repeated N times", () => {
            expect(repeatedArray).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
        });
    });

    describe("unEscapeAngleBrackets", () => {
        const str = "abc&lt;&#60;&gt;&#62;def";
        const expectedString = "abc<<>>def";

        it("should return id from attribute value uri", () => {
            expect(unEscapeAngleBrackets(str)).toEqual(expectedString);
        });
    });

    describe("formatLegendLabel", () => {
        const testSet = [
            // format with %
            [0.5, "%", 5, "50%"],
            // diff < 10
            [0.245, "", 4, "0.25"],
            [5.58, "", 4, "5.6"],
            [58.76, "", 9, "58.8"],
            // diff < 10000
            [9300, "", 20, "9300"],
            // diff > 100000
            [0.245, "", 20000, "0"],
            [5.58, "", 20000, "6"],
            [58.76, "", 20000, "59"],
            [1234, "", 20000, "1.2k"],
            [999490, "", 20000, "999k"],
            [999555, "", 20000, "1M"],
            [9095550, "", 20000, "9.1M"],
            [19999555, "", 20000, "20M"],
            [169995550, "", 20000, "170M"],
            [999400000, "", 20000, "999M"],
            [999600000, "", 20000, "1G"],
        ];

        testSet.forEach((testCase) => {
            it(`should correctly format  number ${testCase[0]}`, () => {
                expect(
                    formatLegendLabel(testCase[0] as number, testCase[1] as string, testCase[2] as number, [
                        "k",
                        "M",
                        "G",
                    ]),
                ).toEqual(testCase[3] as string);
            });
        });
    });

    describe("getPrimaryChartType", () => {
        it("should return the chart type on left y axis", () => {
            const chartOptions = {
                type: "line",
                data: {
                    series: [
                        { type: "line", yAxis: 1 },
                        { type: "column", yAxis: 0 },
                        { type: "line", yAxis: 1 },
                    ],
                },
            };

            expect(getPrimaryChartType(chartOptions)).toEqual("column");
        });

        it("should return default chart type", () => {
            const chartOptions = {
                type: "column",
                data: {
                    series: [{ yAxis: 1 }, { yAxis: 0 }, { yAxis: 1 }],
                },
            };

            expect(getPrimaryChartType(chartOptions)).toEqual("column");
        });
    });

    describe("unwrap", () => {
        it("should unwrap an object", () => {
            expect(unwrap({ key: "value" })).toEqual("value");
        });
    });

    describe("percentFormatter", () => {
        it.each([
            ["0%", 0],
            ["49.01%", 49.01],
            ["100%", 100],
            ["", null],
        ])('should return "%s" when input is %s', (formattedValue: string, value: number) => {
            expect(percentFormatter(value)).toEqual(formattedValue);
        });
    });

    describe("getAxesCounts", () => {
        it("should return both axes as singles for empty secondary config", () => {
            expect(getAxesCounts({})).toEqual([1, 1]);
        });

        it("should return dual x axes", () => {
            expect(
                getAxesCounts({
                    secondary_xaxis: {
                        measures: ["m1"],
                    },
                }),
            ).toEqual([2, 1]);
        });

        it("should return dual y axes", () => {
            expect(
                getAxesCounts({
                    secondary_yaxis: {
                        measures: ["m1"],
                    },
                }),
            ).toEqual([1, 2]);
        });
    });
});
