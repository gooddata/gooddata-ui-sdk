// (C) 2007-2018 GoodData Corporation
import {
    getCellClassNames,
    getCellStyleAndFormattedValue,
    getMeasureCellFormattedValue,
    getMeasureCellStyle,
} from "../tableCell";
import { IMappingHeader } from "../../interfaces/MappingHeader";

import { TABLE_HEADERS_2A_3M } from "../../components/visualizations/table/fixtures/2attributes3measures";

const ATTRIBUTE_HEADER: IMappingHeader = TABLE_HEADERS_2A_3M[0];
const FIRST_MEASURE_HEADER: IMappingHeader = TABLE_HEADERS_2A_3M[2];
const SECOND_MEASURE_HEADER: IMappingHeader = TABLE_HEADERS_2A_3M[3];
const THIRD_MEASURE_HEADER: IMappingHeader = TABLE_HEADERS_2A_3M[4];

describe("Table utils - Cell", () => {
    describe("getCellClassNames", () => {
        it("should get class names for non drillable cell", () => {
            expect(getCellClassNames(3, 9, false)).toEqual("gd-cell s-cell-3-9 s-table-cell");
        });

        it("should get class names for drillable cell", () => {
            expect(getCellClassNames(3, 9, true)).toEqual(
                "gd-cell-drillable gd-cell s-cell-3-9 s-table-cell",
            );
        });
    });

    describe("getCellStyleAndFormattedValue", () => {
        it("should get style and formattedValue for attribute", () => {
            expect(getCellStyleAndFormattedValue(ATTRIBUTE_HEADER, { uri: "foo", name: "Apple" })).toEqual({
                style: {},
                formattedValue: "Apple",
            });
        });

        it("should get styled dash when the value is null", () => {
            expect(getCellStyleAndFormattedValue(FIRST_MEASURE_HEADER, null)).toEqual({
                style: {
                    color: "#94a1ad",
                    fontWeight: "bold",
                },
                formattedValue: "–",
            });
        });

        it("should get style and formattedValue for measure without color", () => {
            expect(getCellStyleAndFormattedValue(FIRST_MEASURE_HEADER, "1234567.89")).toEqual({
                style: {},
                formattedValue: "$1,234,567.89",
            });
        });

        it("should get style and formattedValue for measure with color", () => {
            expect(getCellStyleAndFormattedValue(SECOND_MEASURE_HEADER, "9876543.21")).toEqual({
                style: {
                    color: "#FF0000",
                },
                formattedValue: "$9,876,543.21",
            });
        });

        it("should get style and formattedValue for measure with color and backgroundColor", () => {
            expect(getCellStyleAndFormattedValue(THIRD_MEASURE_HEADER, "9876543.21")).toEqual({
                style: {
                    backgroundColor: "#ffff00",
                    color: "#FF0000",
                },
                formattedValue: "$9,876,543.21",
            });
        });

        it("should apply color when the argument applyColor is true", () => {
            expect(getCellStyleAndFormattedValue(SECOND_MEASURE_HEADER, "9876543.21", true)).toEqual({
                style: {
                    color: "#FF0000",
                },
                formattedValue: "$9,876,543.21",
            });
        });

        it("should apply color and backgroundColor when the argument applyColor is true", () => {
            expect(getCellStyleAndFormattedValue(THIRD_MEASURE_HEADER, "9876543.21", true)).toEqual({
                style: {
                    backgroundColor: "#ffff00",
                    color: "#FF0000",
                },
                formattedValue: "$9,876,543.21",
            });
        });

        it("should NOT apply color or backgroundColor whe the argument applyColor is false", () => {
            expect(getCellStyleAndFormattedValue(THIRD_MEASURE_HEADER, "9876543.21", false)).toEqual({
                style: {},
                formattedValue: "$9,876,543.21",
            });
        });

        it("should get styled dash when the value is null even if the param applyColor is false", () => {
            expect(getCellStyleAndFormattedValue(FIRST_MEASURE_HEADER, null, false)).toEqual({
                style: {
                    color: "#94a1ad",
                    fontWeight: "bold",
                },
                formattedValue: "–",
            });
        });

        it("should get style and formattedValue if separators are not defined (integer number)", () => {
            expect(getCellStyleAndFormattedValue(FIRST_MEASURE_HEADER, "1234567")).toEqual({
                style: {},
                formattedValue: "$1,234,567.00",
            });
        });

        it("should get style and formattedValue if separators are not defined (float number)", () => {
            expect(getCellStyleAndFormattedValue(FIRST_MEASURE_HEADER, "1234567.89")).toEqual({
                style: {},
                formattedValue: "$1,234,567.89",
            });
        });

        it("should get style and formattedValue if separators are dot and comma (small integer number)", () => {
            expect(
                getCellStyleAndFormattedValue(FIRST_MEASURE_HEADER, "123", undefined, {
                    thousand: ".",
                    decimal: ",",
                }),
            ).toEqual({
                style: {},
                formattedValue: "$123,00",
            });
        });

        it("should get style and formattedValue if separators are dot and comma (big integer number)", () => {
            expect(
                getCellStyleAndFormattedValue(FIRST_MEASURE_HEADER, "1234567", undefined, {
                    thousand: ".",
                    decimal: ",",
                }),
            ).toEqual({
                style: {},
                formattedValue: "$1.234.567,00",
            });
        });

        it("should get style and formattedValue if separators are dot and comma (float number)", () => {
            expect(
                getCellStyleAndFormattedValue(FIRST_MEASURE_HEADER, "1234567.89", undefined, {
                    thousand: ".",
                    decimal: ",",
                }),
            ).toEqual({
                style: {},
                formattedValue: "$1.234.567,89",
            });
        });

        it("should get style and formattedValue if separators are empty strings", () => {
            expect(
                getCellStyleAndFormattedValue(FIRST_MEASURE_HEADER, "1234567.89", undefined, {
                    thousand: "",
                    decimal: "",
                }),
            ).toEqual({
                style: {},
                formattedValue: "$123456789",
            });
        });

        it("should get style and formattedValue if separators are spaces", () => {
            expect(
                getCellStyleAndFormattedValue(FIRST_MEASURE_HEADER, "1234567.89", undefined, {
                    thousand: " ",
                    decimal: " ",
                }),
            ).toEqual({
                style: {},
                formattedValue: "$1 234 567 89",
            });
        });
    });

    describe("getMeasureCellFormattedValue", () => {
        it("should get '-' when cellContent=null", () => {
            expect(getMeasureCellFormattedValue(null, "[red]$#,##0.00", undefined)).toEqual("–");
        });

        it("should NOT get 'NaN' when cellContent=''", () => {
            expect(getMeasureCellFormattedValue("", "[red]$#,##0.00", undefined)).toEqual("NaN");
        });

        it("should get formatted value for number", () => {
            expect(
                getMeasureCellFormattedValue("123456789", "[red]$#,##0.00", { thousand: ".", decimal: "," }),
            ).toEqual("$123.456.789,00");
        });
    });

    describe("getMeasureCellStyle", () => {
        it("should get empty value style when cellContent=null", () => {
            expect(getMeasureCellStyle(null, "[red]$#,##0.00", undefined, true)).toEqual({
                color: "#94a1ad",
                fontWeight: "bold",
            });
        });

        it("should NOT get style when cellContent=''", () => {
            expect(getMeasureCellStyle("", "[red]$#,##0.00", undefined, true)).toEqual({});
        });

        it("should get style for number with color in format when applyColor=true", () => {
            expect(getMeasureCellStyle("123456789", "[red]$#,##0.00", undefined, true)).toEqual({
                color: "#FF0000",
            });
        });

        it("should get style for number with backgroundColor in format when applyColor=true", () => {
            expect(
                getMeasureCellStyle("123456789", "[backgroundColor=ffff00]$#,##0.00", undefined, true),
            ).toEqual({
                backgroundColor: "#ffff00",
            });
        });

        it("should get style for number with color and backgroundColor in format when applyColor=true", () => {
            expect(
                getMeasureCellStyle("123456789", "[backgroundColor=ffff00][red]$#,##0.00", undefined, true),
            ).toEqual({
                backgroundColor: "#ffff00",
                color: "#FF0000",
            });
        });

        it("should NOT get style for number with color in format when applyColor=false", () => {
            expect(getMeasureCellStyle("123456789", "[red]$#,##0.00", undefined, false)).toEqual({});
        });

        it("should NOT get style for number with backgroundColor in format when applyColor=false", () => {
            expect(
                getMeasureCellStyle("123456789", "[backgroundColor=ffff00]$#,##0.00", undefined, false),
            ).toEqual({});
        });

        it("should NOT get style for number without color or backgroundColor in format when applyColor=true", () => {
            expect(getMeasureCellStyle("123456789", "$#,##0.00", undefined, true)).toEqual({});
        });
    });
});
