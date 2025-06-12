// (C) 2007-2018 GoodData Corporation
import { formatItemValue, formatPercentageValue } from "../HeadlineDataItemUtils.js";
import { describe, it, expect } from "vitest";

function buildHeaderDataItem(value: string, format?: string) {
    return {
        uri: "42",
        title: "Apples",
        localIdentifier: "abc",
        value,
        format,
    };
}

describe("HeadlineDataItemUtils", () => {
    describe("formatItemValue", () => {
        it("should return empty value if null value is provided without format", () => {
            const result = formatItemValue(buildHeaderDataItem(null));
            expect(result).toEqual({
                value: "–",
                isValueEmpty: true,
                cssStyle: {},
            });
        });

        it("should return empty value if undefined value is provided without format", () => {
            const result = formatItemValue(buildHeaderDataItem(undefined));
            expect(result).toEqual({
                value: "–",
                isValueEmpty: true,
                cssStyle: {},
            });
        });

        it("should return empty value if empty string value is provided without format", () => {
            const result = formatItemValue(buildHeaderDataItem(""));
            expect(result).toEqual({
                value: "–",
                isValueEmpty: true,
                cssStyle: {},
            });
        });

        it("should return empty value if non number string value is provided without format", () => {
            const result = formatItemValue(buildHeaderDataItem("invalid-value"));
            expect(result).toEqual({
                value: "–",
                isValueEmpty: true,
                cssStyle: {},
            });
        });

        it("should return empty value if null value is provided with format", () => {
            const result = formatItemValue(buildHeaderDataItem(null, "[=null]EMPTY"));
            expect(result).toEqual({
                value: "EMPTY",
                isValueEmpty: false, // user provided value is not considered as invalid, i.e., empty
                cssStyle: {},
            });
        });

        it("should return empty value if null value is provided without [=null] format definition", () => {
            const result = formatItemValue(buildHeaderDataItem(null, "[color=9c46b5]$#,##0.00"));
            expect(result).toEqual({
                value: "–",
                isValueEmpty: true,
                cssStyle: {},
            });
        });

        it("should return empty value if undefined value is provided with format", () => {
            const result = formatItemValue(buildHeaderDataItem(undefined, "[=null]EMPTY"));
            expect(result).toEqual({
                value: "–",
                isValueEmpty: true,
                cssStyle: {},
            });
        });

        it("should return empty value if empty string value is provided with format", () => {
            const result = formatItemValue(buildHeaderDataItem("", "[=null]EMPTY"));
            expect(result).toEqual({
                value: "–",
                isValueEmpty: true,
                cssStyle: {},
            });
        });

        it("should return empty value if non number string value is provided with format", () => {
            const result = formatItemValue(buildHeaderDataItem("invalid-value", "[=null]EMPTY"));
            expect(result).toEqual({
                value: "–",
                isValueEmpty: true,
                cssStyle: {},
            });
        });

        it("should return value without style if positive number string value is provided without format", () => {
            const result = formatItemValue(buildHeaderDataItem("123456.052"));
            expect(result).toEqual({
                value: "123456.052",
                isValueEmpty: false,
                cssStyle: {},
            });
        });

        it("should return value without style if negative number string value is provided without format", () => {
            const result = formatItemValue(buildHeaderDataItem("-123456.056"));
            expect(result).toEqual({
                value: "-123456.056",
                isValueEmpty: false,
                cssStyle: {},
            });
        });

        it("should return formatted value with color from provided value with format", () => {
            const result = formatItemValue(buildHeaderDataItem("-123456.056", "[color=9c46b5]$#,##0.00"));
            expect(result).toEqual({
                value: "$-123,456.06",
                isValueEmpty: false,
                cssStyle: {
                    color: "#9c46b5",
                },
            });
        });

        it("should return formatted value with backgroundColor from provided value with format", () => {
            const result = formatItemValue(
                buildHeaderDataItem("-123456.056", "[backgroundColor=d2ccde]$#,##0.00"),
            );
            expect(result).toEqual({
                value: "$-123,456.06",
                isValueEmpty: false,
                cssStyle: {
                    backgroundColor: "#d2ccde",
                },
            });
        });

        it("should return formatted value with color and backgroundColor from provided value with format", () => {
            const result = formatItemValue(
                buildHeaderDataItem("-123456.056", "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00"),
            );
            expect(result).toEqual({
                value: "$-123,456.06",
                isValueEmpty: false,
                cssStyle: {
                    color: "#9c46b5",
                    backgroundColor: "#d2ccde",
                },
            });
        });

        it("should return rounded formatted percentage value", () => {
            const result = formatItemValue(buildHeaderDataItem("0.4401165460495564", "#,##0%"));
            expect(result).toEqual({
                value: "44%",
                isValueEmpty: false,
                cssStyle: {},
            });
        });
    });

    describe("formatPercentageValue", () => {
        it("should return formatted value when input positive value is in interval <-999;999>", () => {
            const result = formatPercentageValue(buildHeaderDataItem("123"));
            expect(result).toEqual({
                value: "123%",
                isValueEmpty: false,
            });
        });

        it("should return formatted value when input negative value is in interval <-999;999>", () => {
            const result = formatPercentageValue(buildHeaderDataItem("-123"));
            expect(result).toEqual({
                value: "-123%",
                isValueEmpty: false,
            });
        });

        it("should return formatted value when input value is above 999", () => {
            const result = formatPercentageValue(buildHeaderDataItem("1000"));
            expect(result).toEqual({
                value: ">999%",
                isValueEmpty: false,
            });
        });

        it("should return formatted value when input value is below -999", () => {
            const result = formatPercentageValue(buildHeaderDataItem("-1000"));
            expect(result).toEqual({
                value: "<-999%",
                isValueEmpty: false,
            });
        });

        it("should return empty value when input value is null", () => {
            const result = formatPercentageValue(buildHeaderDataItem(null));
            expect(result).toEqual({
                value: "–",
                isValueEmpty: true,
            });
        });

        it("should return empty value when input value is empty string", () => {
            const result = formatPercentageValue(buildHeaderDataItem(""));
            expect(result).toEqual({
                value: "–",
                isValueEmpty: true,
            });
        });

        it("should return empty value when input value is not a number", () => {
            const result = formatPercentageValue(buildHeaderDataItem("NotANumber"));
            expect(result).toEqual({
                value: "–",
                isValueEmpty: true,
            });
        });
    });
});
