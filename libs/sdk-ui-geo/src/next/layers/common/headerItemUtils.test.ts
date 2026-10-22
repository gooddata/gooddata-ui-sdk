// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IResultAttributeHeader } from "@gooddata/sdk-model";

import { getAttributeDataAndUris } from "./headerItemUtils.js";

function item(name: string | null, formattedName?: string): IResultAttributeHeader {
    return {
        attributeHeaderItem: {
            uri: name as string,
            name: name as string,
            ...(formattedName === undefined ? {} : { formattedName }),
        },
    };
}

describe("getAttributeDataAndUris", () => {
    const headerItems = [[item("1234.5", "1,234.5"), item(""), item(null)]];

    it("reads the formatted values by default", () => {
        expect(getAttributeDataAndUris(headerItems, 0, "(empty)", "(null)")).toEqual({
            data: ["1,234.5", "(empty)", "(null)"],
            uris: ["1234.5", "", null],
        });
    });

    it("reads the raw values when asked to", () => {
        expect(getAttributeDataAndUris(headerItems, 0, "(empty)", "(null)", false)).toEqual({
            data: ["1234.5", "(empty)", "(null)"],
            uris: ["1234.5", "", null],
        });
    });
});
