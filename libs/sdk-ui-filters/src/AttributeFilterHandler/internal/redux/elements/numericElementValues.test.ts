// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IAttributeElement } from "@gooddata/sdk-model";

import {
    getNumberFormattedElementRawTitle,
    toPlainNumberText,
    toRawValueSearch,
} from "./numericElementValues.js";

const element = (title: string | null, formattedTitle?: string): IAttributeElement => ({
    title,
    uri: title,
    ...(formattedTitle === undefined ? {} : { formattedTitle }),
});

const czech = { thousand: " ", decimal: "," };
const german = { thousand: ".", decimal: "," };

describe("toPlainNumberText", () => {
    it.each([
        ["1234.5", undefined, "1234.5"],
        ["1,234.5", undefined, "1234.5"],
        ["-1,234", undefined, "-1234"],
        ["1 234,5", czech, "1234.5"],
        ["1 234,5", czech, "1234.5"],
        ["1.234,5", german, "1234.5"],
        ["12,", german, "12."],
        [",5", german, ".5"],
        ["  42 ", undefined, "42"],
    ])("reads %j as a number", (text, separators, expected) => {
        expect(toPlainNumberText(text, separators)).toBe(expected);
    });

    it.each([
        ["$1,234.50", undefined],
        ["1.2 K", undefined],
        ["50%", undefined],
        ["1.2.3", undefined],
        ["1,234.5", german],
        // a dot in a position other than thousands does not group them
        ["1234.5", german],
        ["1.23", german],
        ["12,34", undefined],
        ["-", undefined],
        ["abc", undefined],
        ["", undefined],
    ])("does not read %j as a number", (text, separators) => {
        expect(toPlainNumberText(text, separators)).toBeUndefined();
    });
});

describe("toRawValueSearch", () => {
    it("searches a number typed with the display separators by its raw value", () => {
        expect(toRawValueSearch("1 234,5", "#,##0.0", czech)).toBe("1234.5");
        expect(toRawValueSearch("1.234", "#,##0", german)).toBe("1234");
        expect(toRawValueSearch("1.234,5", "#,##0.0", german)).toBe("1234.5");
        // padding of the displayed value is not in the raw value
        expect(toRawValueSearch("1 234,50", "#,##0.00", czech)).toBe("1234.5");
        expect(toRawValueSearch("1,0", "#,##0.0", german)).toBe("1");
        expect(toRawValueSearch("100", "#,##0", undefined)).toBe("100");
        expect(toRawValueSearch("12,", "#,##0", german)).toBe("12.");
    });

    it("keeps the search as typed when it is not a number or the values have no number format", () => {
        expect(toRawValueSearch("1.2 K", "#,##0", undefined)).toBe("1.2 K");
        expect(toRawValueSearch("1,234", undefined, undefined)).toBe("1,234");
        expect(toRawValueSearch("", "#,##0", undefined)).toBe("");
        // a raw value copied from the item tooltip stays as it is
        expect(toRawValueSearch("1234.5", "#,##0.0", german)).toBe("1234.5");
    });
});

describe("getNumberFormattedElementRawTitle", () => {
    it("gives the raw value when the displayed value says more than the separators", () => {
        expect(getNumberFormattedElementRawTitle(element("1.2349", "1.23"), undefined)).toBe("1.2349");
        expect(getNumberFormattedElementRawTitle(element("1234", "1.2 K"), undefined)).toBe("1234");
        expect(getNumberFormattedElementRawTitle(element("1234.5", "$1,234.50"), undefined)).toBe("1234.5");
    });

    it("gives nothing when the displayed value differs only in separators or padding", () => {
        expect(getNumberFormattedElementRawTitle(element("1234.5", "1 234,50"), czech)).toBeUndefined();
        expect(getNumberFormattedElementRawTitle(element("1234.5", "1,234.5"), undefined)).toBeUndefined();
    });

    it("gives nothing for elements without a formatted or a raw value", () => {
        expect(getNumberFormattedElementRawTitle(element("1234.5"), undefined)).toBeUndefined();
        expect(getNumberFormattedElementRawTitle(element(null, "x"), undefined)).toBeUndefined();
        expect(getNumberFormattedElementRawTitle(element("", "x"), undefined)).toBeUndefined();
    });
});
