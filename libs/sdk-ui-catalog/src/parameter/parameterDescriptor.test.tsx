// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IParameterDefinition, idRef } from "@gooddata/sdk-model";

import { convertParameterToCatalogItem } from "../catalogItem/converter.js";

import { parameterDescriptor } from "./parameterDescriptor.js";

function isEditable(definition: IParameterDefinition): boolean | undefined {
    const item = convertParameterToCatalogItem({
        type: "parameter",
        id: "parameter",
        uri: "",
        ref: idRef("parameter", "parameter"),
        title: "Parameter",
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        definition,
    });
    return renderHook(() => parameterDescriptor.useIsItemEditable?.(item)).result.current;
}

describe("parameterDescriptor.useIsItemEditable", () => {
    it("allows editing a NUMBER or STRING parameter", () => {
        expect(isEditable({ type: "NUMBER", defaultValue: 5 })).toBe(true);
        expect(isEditable({ type: "STRING", defaultValue: "Actual" })).toBe(true);
    });

    it("keeps a DATE_RANGE parameter read-only", () => {
        expect(
            isEditable({
                type: "DATE_RANGE",
                defaultValue: { granularity: "GDC.time.month", from: "2025-08" },
            }),
        ).toBe(false);
    });
});
