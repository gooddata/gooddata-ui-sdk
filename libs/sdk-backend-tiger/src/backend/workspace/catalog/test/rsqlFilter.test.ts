// (C) 2022-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { ObjRef } from "@gooddata/sdk-model";

import { tagsToRsqlFilter } from "../rsqlFilter.js";

describe("tagsToRsqlFilter", () => {
    it("should parse tags input with correct RSQL format filtering", () => {
        const includeTagsInput: ObjRef[] = [
            {
                identifier: "Products",
            },
            {
                identifier: "Order Lines",
            },
        ];
        const excludeTagsInput: ObjRef[] = [
            {
                identifier: "Campaign channels",
            },
            {
                identifier: "Campaign ids",
            },
        ];

        const expectedResult = tagsToRsqlFilter({
            includeTags: includeTagsInput,
            excludeTags: excludeTagsInput,
        });

        expect(expectedResult).toEqual(
            "tags=in=(Products,'Order Lines');tags=out=('Campaign channels','Campaign ids')",
        );
    });
});
