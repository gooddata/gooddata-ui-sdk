// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDataView } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDescriptor,
    type IMeasureGroupDescriptor,
    type IResultAttributeHeader,
    type IResultHeader,
    idRef,
} from "@gooddata/sdk-model";

import {
    attributeHeaderDisplayValue,
    formatAttributeHeaderValues,
    formatAttributeValue,
} from "./attributeNumberFormat.js";
import { type ValueFormatter } from "./dataAccessConfig.js";

const valueFormatter: ValueFormatter = (value, format) => `${format}(${value})`;

function attributeDescriptor(identifier: string, numberFormat?: string): IAttributeDescriptor {
    return {
        attributeHeader: {
            uri: "",
            identifier,
            localIdentifier: `${identifier}_local`,
            ref: idRef(identifier, "computedAttribute"),
            name: identifier,
            formOf: { uri: "", identifier, name: identifier, ref: idRef(identifier, "computedAttribute") },
            primaryLabel: idRef(identifier, "computedAttribute"),
            numberFormat,
        },
    };
}

const measureGroup: IMeasureGroupDescriptor = {
    measureGroupHeader: {
        items: [{ measureHeaderItem: { localIdentifier: "m1", name: "M1", format: "#,##0" } }],
    },
};

function header(name: string | null, formattedName?: string): IResultAttributeHeader {
    return {
        attributeHeaderItem: {
            uri: name ?? "",
            name,
            ...(formattedName === undefined ? {} : { formattedName }),
        },
    };
}

function dataView(descriptors: IAttributeDescriptor[], headerItems: IResultHeader[][]): IDataView {
    return {
        offset: [0, 0],
        count: [headerItems[0]?.length ?? 0, 1],
        totalCount: [headerItems[0]?.length ?? 0, 1],
        headerItems: [headerItems, [[{ measureHeaderItem: { name: "M1", order: 0 } }]]],
        data: [[1]],
        definition: {} as IDataView["definition"],
        result: {
            dimensions: [{ headers: descriptors }, { headers: [measureGroup] }],
        } as IDataView["result"],
        metadata: {} as IDataView["metadata"],
    } as unknown as IDataView;
}

describe("formatAttributeValue", () => {
    it.each(["1234.5", "-5", "+5", "0", ".5", "5.", "1e3", "-1.5E-3", " 42 "])(
        "formats the number %j",
        (value) => {
            expect(formatAttributeValue(value, "#", valueFormatter)).toBe(`#(${value})`);
        },
    );

    it.each(["12 Main St", "2011-04", "0x1A", "1,234", "abc", "1e", "Infinity", "NaN", "-"])(
        "leaves the text %j alone",
        (value) => {
            expect(formatAttributeValue(value, "#", valueFormatter)).toBe(value);
        },
    );

    it("leaves empty and null values alone", () => {
        expect(formatAttributeValue("", "#", valueFormatter)).toBe("");
        expect(formatAttributeValue(null, "#", valueFormatter)).toBeNull();
    });
});

describe("attributeHeaderDisplayValue", () => {
    const descriptor = attributeDescriptor("ca", "#,##0");

    it("returns the formatted name when present", () => {
        expect(
            attributeHeaderDisplayValue(header("2026-01-01", "Jan 2026"), descriptor, valueFormatter),
        ).toBe("Jan 2026");
    });

    it("formats a numeric name with the descriptor's number format", () => {
        expect(attributeHeaderDisplayValue(header("123456.78"), descriptor, valueFormatter)).toBe(
            "#,##0(123456.78)",
        );
    });

    it("leaves empty, null and non-numeric names alone", () => {
        expect(attributeHeaderDisplayValue(header(""), descriptor, valueFormatter)).toBe("");
        expect(attributeHeaderDisplayValue(header(null), descriptor, valueFormatter)).toBeNull();
        expect(attributeHeaderDisplayValue(header("Gold"), descriptor, valueFormatter)).toBe("Gold");
    });

    it("returns the raw name when the descriptor has no number format or no formatter is given", () => {
        expect(attributeHeaderDisplayValue(header("123"), attributeDescriptor("ca"), valueFormatter)).toBe(
            "123",
        );
        expect(attributeHeaderDisplayValue(header("123"), descriptor)).toBe("123");
        expect(attributeHeaderDisplayValue(header("123"))).toBe("123");
    });
});

describe("formatAttributeHeaderValues", () => {
    it("adds formattedName to numeric element values of attributes with a number format", () => {
        const view = dataView(
            [attributeDescriptor("ca", "#,##0"), attributeDescriptor("plain")],
            [
                [header("1000"), header("Gold"), header(""), header(null)],
                [header("42"), header("43"), header("44"), header("45")],
            ],
        );

        const formatted = formatAttributeHeaderValues(view, valueFormatter);

        expect(formatted).not.toBe(view);
        expect(formatted.headerItems[0][0]).toEqual([
            header("1000", "#,##0(1000)"),
            header("Gold"),
            header(""),
            header(null),
        ]);
        // attribute without a number format is untouched
        expect(formatted.headerItems[0][1]).toBe(view.headerItems[0][1]);
        // measure group header items are untouched
        expect(formatted.headerItems[1]).toEqual(view.headerItems[1]);
        // raw values stay for drilling
        expect(formatted.headerItems[0][0][0]).toMatchObject({
            attributeHeaderItem: { name: "1000", uri: "1000" },
        });
    });

    it("keeps an existing formattedName", () => {
        const view = dataView([attributeDescriptor("ca", "#,##0")], [[header("20260101", "Jan 2026")]]);

        expect(formatAttributeHeaderValues(view, valueFormatter).headerItems[0][0]).toEqual([
            header("20260101", "Jan 2026"),
        ]);
    });

    it("returns the same data view when nothing is formatted and does not mutate the original", () => {
        const view = dataView([attributeDescriptor("plain")], [[header("1")]]);
        const before = JSON.stringify(view.headerItems);

        expect(formatAttributeHeaderValues(view, valueFormatter)).toBe(view);

        const other = dataView([attributeDescriptor("ca", "0")], [[header("1")]]);
        formatAttributeHeaderValues(other, valueFormatter);
        expect(JSON.stringify(view.headerItems)).toBe(before);
        expect((other.headerItems[0][0][0] as IResultAttributeHeader).attributeHeaderItem).not.toHaveProperty(
            "formattedName",
        );
    });

    it("delegates everything but header items to the original view", () => {
        const view = dataView([attributeDescriptor("ca", "0")], [[header("1")]]);

        const formatted = formatAttributeHeaderValues(view, valueFormatter);

        expect(formatted.data).toBe(view.data);
        expect(formatted.result).toBe(view.result);
        expect(formatted.count).toBe(view.count);
        expect(formatted.metadata).toBe(view.metadata);
    });
});
