// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDashboardParameter, type IParameterMetadataObject, idRef } from "@gooddata/sdk-model";

import { resolveFilterViewParameterValues } from "../filterViewParameters.js";

const topNParameter: IDashboardParameter = {
    ref: idRef("topN", "parameter"),
    parameterType: "NUMBER",
    mode: "active",
};

describe("resolveFilterViewParameterValues", () => {
    const workspaceParameter: IParameterMetadataObject = {
        type: "parameter",
        id: "topN",
        uri: "/topN",
        ref: topNParameter.ref,
        title: "Top N",
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        definition: { type: "NUMBER", defaultValue: 10 },
    };

    it("preserves explicit values from the filter view", () => {
        expect(
            resolveFilterViewParameterValues([{ ...topNParameter, value: 42 }], [workspaceParameter]),
        ).toEqual([{ ref: topNParameter.ref, value: 42 }]);
    });

    it("fills missing values from the workspace default", () => {
        expect(resolveFilterViewParameterValues([topNParameter], [workspaceParameter])).toEqual([
            { ref: topNParameter.ref, value: 10 },
        ]);
    });

    it("keeps missing values unresolved when workspace default is unavailable", () => {
        expect(resolveFilterViewParameterValues([topNParameter], [])).toEqual([
            { ref: topNParameter.ref, value: undefined },
        ]);
    });
});
