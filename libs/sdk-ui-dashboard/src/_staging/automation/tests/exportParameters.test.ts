// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { exportParametersToValues } from "../index.js";

describe("exportParametersToValues", () => {
    it("parses the string wire value to a number and refs the parameter by id", () => {
        expect(
            exportParametersToValues([
                { id: "topN", value: "8", title: "Top N" },
                { id: "limit", value: "50", title: "Limit" },
            ]),
        ).toEqual([
            { ref: idRef("topN", "parameter"), value: 8 },
            { ref: idRef("limit", "parameter"), value: 50 },
        ]);
    });

    it("drops entries whose wire value is not a finite number", () => {
        expect(
            exportParametersToValues([
                { id: "topN", value: "not-a-number", title: "Top N" },
                { id: "limit", value: "5", title: "Limit" },
            ]),
        ).toEqual([{ ref: idRef("limit", "parameter"), value: 5 }]);
    });
});
