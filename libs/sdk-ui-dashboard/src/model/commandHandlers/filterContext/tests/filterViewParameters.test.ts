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

    const scenarioParameter: IDashboardParameter = {
        ref: idRef("scenario", "parameter"),
        parameterType: "STRING",
        mode: "active",
    };

    const scenarioWorkspaceParameter: IParameterMetadataObject = {
        type: "parameter",
        id: "scenario",
        uri: "/scenario",
        ref: scenarioParameter.ref,
        title: "Scenario",
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        definition: { type: "STRING", defaultValue: "Actual" },
    };

    it("fills a missing string value from the workspace string default", () => {
        expect(resolveFilterViewParameterValues([scenarioParameter], [scenarioWorkspaceParameter])).toEqual([
            { ref: scenarioParameter.ref, value: "Actual" },
        ]);
    });

    it("keeps a missing value unresolved when the workspace parameter type does not match", () => {
        const numberTypedWorkspaceParameter: IParameterMetadataObject = {
            ...scenarioWorkspaceParameter,
            definition: { type: "NUMBER", defaultValue: 10 },
        };
        expect(
            resolveFilterViewParameterValues([scenarioParameter], [numberTypedWorkspaceParameter]),
        ).toEqual([{ ref: scenarioParameter.ref, value: undefined }]);
    });
});
