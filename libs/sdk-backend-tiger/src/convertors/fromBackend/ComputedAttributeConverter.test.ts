// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type JsonApiComputedAttributeOutWithLinks } from "@gooddata/api-client-tiger";

import { convertComputedAttributeToBackend } from "../toBackend/ComputedAttributeConverter.js";

import { convertComputedAttributeFromBackend } from "./ComputedAttributeConverter.js";

const MAQL = 'SELECT CASE WHEN {metric/won} > 100 THEN "High" ELSE "Low" END';

function backendComputedAttribute(
    attributes: Partial<JsonApiComputedAttributeOutWithLinks["attributes"]> = {},
): JsonApiComputedAttributeOutWithLinks {
    return {
        id: "rep_performance",
        type: "computedAttribute",
        links: { self: "/computedAttributes/rep_performance" },
        attributes: {
            title: "Rep performance",
            content: { maql: MAQL },
            ...attributes,
        },
    } as JsonApiComputedAttributeOutWithLinks;
}

describe("computed attribute converters", () => {
    it("keeps the typing, formatting and nullability fields when reading from the backend", () => {
        const result = convertComputedAttributeFromBackend(
            backendComputedAttribute({
                content: { maql: MAQL, format: "#,##0.00", metricType: "CURRENCY" },
                dataType: "NUMERIC",
                valueType: "HYPERLINK",
                isNullable: true,
                nullValue: "N/A",
                isHidden: true,
                locale: "cs-CZ",
            }),
        );

        expect(result).toMatchObject({
            expression: MAQL,
            format: "#,##0.00",
            metricType: "CURRENCY",
            dataType: "NUMERIC",
            valueType: "HYPERLINK",
            isNullable: true,
            nullValue: "N/A",
            isHidden: true,
            locale: "cs-CZ",
        });
    });

    it("derives the fabricated display form type from the value type", () => {
        const hyperlink = convertComputedAttributeFromBackend(
            backendComputedAttribute({ valueType: "HYPERLINK" }),
        );
        expect(hyperlink.displayForms[0].displayFormType).toBe("GDC.link");

        const text = convertComputedAttributeFromBackend(backendComputedAttribute({ valueType: "TEXT" }));
        expect(text.displayForms[0]).not.toHaveProperty("displayFormType");

        const untyped = convertComputedAttributeFromBackend(backendComputedAttribute());
        expect(untyped.displayForms[0]).not.toHaveProperty("displayFormType");
    });

    it("sends the typing, formatting and nullability fields to the backend", () => {
        const result = convertComputedAttributeToBackend({
            type: "computedAttribute",
            title: "Rep performance",
            description: "",
            expression: MAQL,
            format: "#,##0.00",
            metricType: "CURRENCY",
            dataType: "NUMERIC",
            valueType: "HYPERLINK",
            isNullable: true,
            nullValue: "N/A",
            locale: "cs-CZ",
        });

        expect(result).toMatchObject({
            content: { maql: MAQL, format: "#,##0.00", metricType: "CURRENCY" },
            dataType: "NUMERIC",
            valueType: "HYPERLINK",
            isNullable: true,
            nullValue: "N/A",
            locale: "cs-CZ",
        });
    });

    it("keeps optional keys only when the backend returned them", () => {
        const result = convertComputedAttributeFromBackend(backendComputedAttribute());

        for (const key of [
            "format",
            "metricType",
            "dataType",
            "valueType",
            "isNullable",
            "nullValue",
            "locale",
            "isHidden",
        ]) {
            expect(result).not.toHaveProperty(key);
        }
    });

    it("sends optional keys only when the definition sets them", () => {
        const result = convertComputedAttributeToBackend({
            type: "computedAttribute",
            title: "Rep performance",
            description: "",
            expression: MAQL,
        });

        expect(result).toEqual({
            title: "Rep performance",
            description: "",
            content: { maql: MAQL },
        });
    });

    it("round-trips the value type through the sdk-model object", () => {
        const fromBackend = convertComputedAttributeFromBackend(
            backendComputedAttribute({ valueType: "IMAGE" }),
        );
        const toBackend = convertComputedAttributeToBackend(fromBackend);

        expect(toBackend.valueType).toBe("IMAGE");
    });
});
