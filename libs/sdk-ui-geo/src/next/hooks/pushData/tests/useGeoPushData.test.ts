// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IColorAssignment } from "@gooddata/sdk-ui";

import { sortColorAssignmentsAlphabetically } from "../useGeoPushData.js";

function createAssignment(name: string, uri: string): IColorAssignment {
    return {
        headerItem: {
            attributeHeaderItem: {
                name,
                uri,
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
});
