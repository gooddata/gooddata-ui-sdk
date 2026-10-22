// (C) 2025-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IColorAssignment } from "@gooddata/sdk-ui";

import { sortColorAssignmentsAlphabetically } from "./useGeoPushData.js";

function createAssignment(name: string, uri: string, formattedName?: string): IColorAssignment {
    return {
        headerItem: {
            attributeHeaderItem: {
                name,
                uri,
                ...(formattedName === undefined ? {} : { formattedName }),
            },
        },
        color: {
            type: "guid",
            value: `guid-${name}`,
        },
    } as IColorAssignment;
}

describe("sortColorAssignmentsAlphabetically", () => {
    it("sorts assignments alphabetically by header name", () => {
        const zebra = createAssignment("Zebra", "/gdc/md/obj/1/elements?id=zebra");
        const alpha = createAssignment("Alpha", "/gdc/md/obj/1/elements?id=alpha");
        const sorted = sortColorAssignmentsAlphabetically([zebra, alpha]);

        expect(sorted).toEqual([alpha, zebra]);
    });

    it("keeps original order for names equal under case-insensitive comparison", () => {
        const betaUpper = createAssignment("BETA", "/gdc/md/obj/1/elements?id=beta-1");
        const betaLower = createAssignment("beta", "/gdc/md/obj/1/elements?id=beta-2");
        const sorted = sortColorAssignmentsAlphabetically([betaUpper, betaLower]);

        expect(sorted).toEqual([betaUpper, betaLower]);
    });

    it("sorts number-formatted values by their raw values", () => {
        const thousand = createAssignment("1000", "1000", "1,000");
        const twoHundred = createAssignment("200", "200", "200");
        const sorted = sortColorAssignmentsAlphabetically([thousand, twoHundred]);

        expect(sorted).toEqual([twoHundred, thousand]);
    });
});
