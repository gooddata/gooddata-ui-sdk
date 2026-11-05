// (C) 2020-2026 GoodData Corporation

import { invariant } from "ts-invariant";
import { describe, expect, it, vi } from "vitest";

import { type DimensionHeader } from "@gooddata/api-client-tiger";
import {
    type IAttributeDescriptor,
    type IDimensionDescriptor,
    type IResultAttributeHeader,
    idRef,
    isResultAttributeHeader,
} from "@gooddata/sdk-model";

import { defaultDateFormatter } from "../dateFormatting/defaultDateFormatter.js";

import { getTransformDimensionHeaders } from "./DimensionHeaderConverter.js";
import { transformExecutionResult } from "./result.js";
import {
    mockDimensions,
    mockDimensionsWithDateFormat,
    mockDimensionsWithTotals,
    mockResult,
    mockResultWithTotals,
} from "./result.test.helpers.js";

describe("transformExecutionResult", () => {
    it("should format date dimensions values", () => {
        const transformDimensionHeaders = getTransformDimensionHeaders(
            mockDimensions,
            defaultDateFormatter,
            mockResult.grandTotals,
        );
        const actual = transformExecutionResult(mockResult, transformDimensionHeaders);
        expect(actual).toMatchSnapshot();
    });

    it("should format date dimensions values with date format information", () => {
        const transformDimensionHeaders = getTransformDimensionHeaders(
            mockDimensionsWithDateFormat,
            defaultDateFormatter,
            mockResult.grandTotals,
        );
        const actual = transformExecutionResult(mockResult, transformDimensionHeaders);
        expect(actual).toEqual({
            count: [1, 2],
            data: [["20.0", "40.2"]],
            headerItems: [
                [
                    [
                        {
                            measureHeaderItem: {
                                name: "Sum of duration",
                                order: 0,
                            },
                        },
                    ],
                ],
                [
                    [
                        {
                            attributeHeaderItem: {
                                formattedName: "Q4 1906",
                                name: "1906-4",
                                normalizedValue: expect.anything(),
                                uri: "1906-4",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                formattedName: "Q1 1910",
                                name: "1910-1",
                                normalizedValue: expect.anything(),
                                uri: "1910-1",
                            },
                        },
                    ],
                ],
            ],
            offset: [0, 0],
            total: [1, 2],
        });
    });

    it("should correctly link total items with measure items with order property", () => {
        const transformDimensionHeaders = getTransformDimensionHeaders(
            mockDimensionsWithTotals,
            defaultDateFormatter,
            mockResult.grandTotals,
        );
        const actual = transformExecutionResult(mockResultWithTotals, transformDimensionHeaders);
        expect(actual).toMatchSnapshot();
    });
});

describe("getTransformDimensionHeaders for computed attributes", () => {
    const dateFormat = { locale: "en-US", pattern: "dd.MM.yyyy", timezone: "Europe/Prague" };

    function headerItems(
        attributeHeader: Partial<IAttributeDescriptor["attributeHeader"]>,
        values: string[],
    ): Array<IResultAttributeHeader["attributeHeaderItem"] | undefined> {
        const dimensions: IDimensionDescriptor[] = [
            {
                headers: [
                    {
                        attributeHeader: {
                            identifier: "ca_1",
                            localIdentifier: "a1",
                            name: "CA",
                            uri: "",
                            ref: idRef("ca_1", "computedAttribute"),
                            formOf: { identifier: "ca_1", name: "CA", uri: "", ref: idRef("ca_1") },
                            primaryLabel: idRef("ca_1", "computedAttribute"),
                            ...attributeHeader,
                        },
                    },
                ],
            },
        ];
        const dimensionHeaders: DimensionHeader[] = [
            {
                headerGroups: [
                    {
                        headers: values.map((value) => ({
                            attributeHeader: { labelValue: value, primaryLabelValue: value },
                        })),
                    },
                ],
            },
        ];

        const [[headers]] = getTransformDimensionHeaders(dimensions, defaultDateFormatter)(dimensionHeaders);
        return headers.map((header) =>
            isResultAttributeHeader(header) ? header.attributeHeaderItem : undefined,
        );
    }

    function formattedNames(
        attributeHeader: Partial<IAttributeDescriptor["attributeHeader"]>,
        values: string[],
    ): Array<string | undefined> {
        return headerItems(attributeHeader, values).map((item) => item?.formattedName);
    }

    it("should format date values of a DATE computed attribute without granularity as days", () => {
        expect(
            formattedNames({ format: dateFormat, dataType: "DATE" }, ["2026-03-15", "2025-12-01"]),
        ).toEqual(["15.03.2026", "01.12.2025"]);
    });

    it.each(["TIMESTAMP", "TIMESTAMP_TZ"] as const)(
        "should format values of a %s computed attribute without granularity as seconds",
        (dataType) => {
            expect(
                formattedNames({ format: { ...dateFormat, pattern: "dd.MM.yyyy HH:mm:ss" }, dataType }, [
                    "2026-03-15 14:05:09",
                ]),
            ).toEqual(["15.03.2026 14:05:09"]);
        },
    );

    it("should parse values with the granularity the backend states for a computed attribute", () => {
        expect(
            formattedNames(
                {
                    format: { ...dateFormat, pattern: "QQQ y" },
                    dataType: "DATE",
                    formatGranularity: "QUARTER",
                },
                ["2026-1"],
            ),
        ).toEqual(["Q1 2026"]);
    });

    it("should keep the raw value of a computed attribute value not matching its data type", () => {
        expect(formattedNames({ format: dateFormat, dataType: "DATE" }, ["2026-1"])).toEqual(["2026-1"]);
        expect(formattedNames({ format: dateFormat, dataType: "TIMESTAMP" }, ["2026-03-15"])).toEqual([
            "2026-03-15",
        ]);
    });

    it("should keep the raw values of a computed attribute with an unsupported token in its format", () => {
        const warn = vi.spyOn(invariant, "warn").mockImplementation(() => {});

        expect(
            formattedNames(
                { format: { ...dateFormat, pattern: "dd.MM.yyyy HH:mm Z" }, dataType: "TIMESTAMP_TZ" },
                ["2026-03-15 14:05:09"],
            ),
        ).toEqual(["2026-03-15 14:05:09"]);
        expect(warn).toHaveBeenCalledOnce();
        warn.mockRestore();
    });

    it("should keep failing on an unsupported token in the format of a date attribute", () => {
        expect(() =>
            formattedNames(
                {
                    format: { ...dateFormat, pattern: "dd.MM.yyyy Z" },
                    granularity: "DAY",
                    ref: idRef("label_1", "displayForm"),
                },
                ["2026-03-15"],
            ),
        ).toThrow();
    });

    it("should not format values of a computed attribute without a format or of a non-date data type", () => {
        expect(formattedNames({ dataType: "DATE" }, ["2026-03-15"])).toEqual([undefined]);
        expect(formattedNames({ format: dateFormat, dataType: "STRING" }, ["2026-03-15"])).toEqual([
            undefined,
        ]);
        expect(
            formattedNames({ format: dateFormat, dataType: "STRING", formatGranularity: "DAY" }, [
                "2026-03-15",
            ]),
        ).toEqual([undefined]);
    });

    it("should not format values of a granularity the SDK does not model", () => {
        expect(
            formattedNames({ format: dateFormat, dataType: "DATE", formatGranularity: "FISCAL_WEEK" }, [
                "2026-1",
            ]),
        ).toEqual([undefined]);
        expect(
            formattedNames(
                { format: dateFormat, granularity: "FISCAL_WEEK", ref: idRef("label_1", "displayForm") },
                ["2026-1"],
            ),
        ).toEqual([undefined]);
    });

    it("should have the same normalized value for a computed attribute as for a date attribute", () => {
        const [dateAttributeItem] = headerItems(
            { format: dateFormat, granularity: "DAY", ref: idRef("label_1", "displayForm") },
            ["2026-03-15"],
        );
        const [computedAttributeItem] = headerItems({ format: dateFormat, dataType: "DATE" }, ["2026-03-15"]);

        expect(computedAttributeItem?.formattedName).toBe("15.03.2026");
        expect(computedAttributeItem?.normalizedValue).toBe(new Date(2026, 2, 15).toISOString());
        expect(computedAttributeItem?.normalizedValue).toBe(dateAttributeItem?.normalizedValue);
    });

    it("should not format values of a regular attribute without granularity", () => {
        expect(
            formattedNames({ format: dateFormat, ref: idRef("label_1", "displayForm") }, ["2026-03-15"]),
        ).toEqual([undefined]);
    });
});
