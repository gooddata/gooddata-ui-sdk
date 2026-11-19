// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDashboardParameter, type IDashboardTab, idRef } from "@gooddata/sdk-model";

import { pickDashboardTabParameters } from "./parametersState.js";

const topN: IDashboardParameter = {
    ref: idRef("topN", "parameter"),
    parameterType: "NUMBER",
    mode: "active",
};
const region: IDashboardParameter = {
    ref: idRef("region", "parameter"),
    parameterType: "NUMBER",
    mode: "active",
};

function tab(localIdentifier: string, parameters?: IDashboardParameter[]): IDashboardTab {
    return { localIdentifier, title: localIdentifier, parameters };
}

describe("pickDashboardTabParameters", () => {
    it("returns the parameters of the target tab", () => {
        const second = tab("second", [region]);

        expect(pickDashboardTabParameters({ tabs: [tab("first", [topN]), second] }, second)).toEqual([
            region,
        ]);
    });

    it("returns the dashboard parameters when no tab has parameters", () => {
        const first = tab("first");

        expect(pickDashboardTabParameters({ tabs: [first], parameters: [topN] }, first)).toEqual([topN]);
    });

    it("returns no parameters for a tab without parameters when another tab has them", () => {
        const first = tab("first");

        expect(
            pickDashboardTabParameters({ tabs: [first, tab("second", [region])], parameters: [topN] }, first),
        ).toEqual([]);
    });

    it("returns the dashboard parameters of a dashboard without tabs", () => {
        expect(pickDashboardTabParameters({ parameters: [topN] }, undefined)).toEqual([topN]);
    });
});
