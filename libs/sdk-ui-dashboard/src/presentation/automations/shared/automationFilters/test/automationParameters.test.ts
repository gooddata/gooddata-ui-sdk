// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDashboardParameter, type IParameterMetadataObject, idRef } from "@gooddata/sdk-model";

import {
    type IAutomationParameter,
    availableAutomationParameters,
    reconstructAutomationParametersFromValues,
} from "../automationParameters.js";

const workspaceParameter = (
    id: string,
    title: string,
    defaultValue: number,
    constraints?: { min?: number; max?: number },
): IParameterMetadataObject => ({
    type: "parameter",
    id,
    title,
    ref: idRef(id, "parameter"),
    uri: id,
    production: true,
    deprecated: false,
    unlisted: false,
    description: "",
    definition: { type: "NUMBER", defaultValue, constraints },
});

const dashboardParameter = (
    id: string,
    overrides: Partial<IDashboardParameter> = {},
): IDashboardParameter => ({
    ref: idRef(id, "parameter"),
    mode: "active",
    parameterType: "NUMBER",
    ...overrides,
});

describe("availableAutomationParameters — addable workspace parameters", () => {
    const catalog = [
        workspaceParameter("topN", "Top N", 3, { min: 1, max: 10 }),
        workspaceParameter("limit", "Limit", 50),
    ];

    it("resolves catalog NUMBER parameters as addable active chips at the workspace default", () => {
        expect(availableAutomationParameters(catalog, [])).toEqual([
            {
                ref: idRef("topN", "parameter"),
                title: "Top N",
                value: 3,
                mode: "active",
                constraints: { min: 1, max: 10 },
            },
            { ref: idRef("limit", "parameter"), title: "Limit", value: 50, mode: "active" },
        ]);
    });

    it("omits parameters already present in the selected set", () => {
        const selected: IAutomationParameter[] = [
            { ref: idRef("topN", "parameter"), title: "Top N", value: 7, mode: "active" },
        ];

        expect(
            availableAutomationParameters(catalog, selected).map((parameter) => parameter.ref.identifier),
        ).toEqual(["limit"]);
    });

    it("seeds the addable value and title from the dashboard when the parameter is configured", () => {
        const dashboardParams = [dashboardParameter("topN", { value: 5, label: "Customer Top N" })];

        const addable = availableAutomationParameters(catalog, [], dashboardParams);

        const topN = addable.find((parameter) => parameter.ref.identifier === "topN");
        expect(topN?.value).toBe(5);
        expect(topN?.title).toBe("Customer Top N");
        // "limit" is not on the dashboard → falls back to the workspace default and title
        const limit = addable.find((parameter) => parameter.ref.identifier === "limit");
        expect(limit?.value).toBe(50);
        expect(limit?.title).toBe("Limit");
    });

    it("seeds the addable value from the widget's effective value over dashboard and workspace ones", () => {
        const dashboardParams = [dashboardParameter("topN", { value: 5 })];
        // e.g. an insight-level (AD-authored) parameter value the widget currently renders with
        const widgetValues = [{ ref: idRef("topN", "parameter"), value: 8 }];

        const addable = availableAutomationParameters(catalog, [], dashboardParams, widgetValues);

        expect(addable.find((parameter) => parameter.ref.identifier === "topN")?.value).toBe(8);
        // "limit" has no widget-effective value → existing dashboard/workspace fallback applies
        expect(addable.find((parameter) => parameter.ref.identifier === "limit")?.value).toBe(50);
    });

    it("omits parameters the dashboard author set to hidden", () => {
        const dashboardParams = [dashboardParameter("topN", { mode: "hidden" })];

        expect(
            availableAutomationParameters(catalog, [], dashboardParams).map(
                (parameter) => parameter.ref.identifier,
            ),
        ).toEqual(["limit"]);
    });

    it("omits parameters the dashboard author set to readonly", () => {
        const dashboardParams = [dashboardParameter("topN", { mode: "readonly" })];

        expect(
            availableAutomationParameters(catalog, [], dashboardParams).map(
                (parameter) => parameter.ref.identifier,
            ),
        ).toEqual(["limit"]);
    });
});

describe("reconstructAutomationParametersFromValues — reopen existing alert", () => {
    const catalog = [workspaceParameter("topN", "Top N (workspace)", 3, { min: 1, max: 10 })];

    it("derives title from the dashboard label, falling back to the workspace title", () => {
        const labelled = reconstructAutomationParametersFromValues(
            [{ ref: idRef("topN", "parameter"), value: 8 }],
            [dashboardParameter("topN", { mode: "readonly", label: "Customer Top N" })],
            catalog,
        );
        expect(labelled).toEqual([
            {
                ref: idRef("topN", "parameter"),
                title: "Customer Top N",
                value: 8,
                mode: "readonly",
                constraints: { min: 1, max: 10 },
            },
        ]);

        const fallback = reconstructAutomationParametersFromValues(
            [{ ref: idRef("topN", "parameter"), value: 8 }],
            [dashboardParameter("topN")],
            catalog,
        );
        expect(fallback[0].title).toBe("Top N (workspace)");
    });
});
