// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import {
    type IAutomationParameter,
    automationParametersToExportParameters,
    availableAutomationParameters,
    dropStaleAlertParameters,
    hasStaleAlertParameters,
    reconstructAutomationParametersFromExportParameters,
    reconstructAutomationParametersFromValues,
} from "../automationParameters.js";

import {
    dashboardParameter,
    workspaceNumberParameter,
    workspaceStringParameter,
} from "./parameterFixtures.js";

describe("availableAutomationParameters — addable workspace parameters", () => {
    const catalog = [
        workspaceNumberParameter("topN", "Top N", 3, { min: 1, max: 10 }),
        workspaceNumberParameter("limit", "Limit", 50),
    ];

    it("resolves catalog NUMBER parameters as addable active chips at the workspace default", () => {
        expect(availableAutomationParameters(catalog, [], [], [], true)).toEqual([
            {
                ref: idRef("topN", "parameter"),
                title: "Top N",
                value: 3,
                mode: "active",
                definition: { type: "NUMBER", defaultValue: 3, constraints: { min: 1, max: 10 } },
            },
            {
                ref: idRef("limit", "parameter"),
                title: "Limit",
                value: 50,
                mode: "active",
                definition: { type: "NUMBER", defaultValue: 50 },
            },
        ]);
    });

    it("resolves catalog STRING parameters as addable active chips at the workspace default", () => {
        const stringCatalog = [workspaceStringParameter("scenario", "Scenario", "Actual", { maxLength: 20 })];

        expect(availableAutomationParameters(stringCatalog, [], [], [], true)).toEqual([
            {
                ref: idRef("scenario", "parameter"),
                title: "Scenario",
                value: "Actual",
                mode: "active",
                definition: { type: "STRING", defaultValue: "Actual", constraints: { maxLength: 20 } },
            },
        ]);
    });

    it("excludes a catalog STRING parameter from the available list when string parameters are gated off", () => {
        const stringCatalog = [workspaceStringParameter("scenario", "Scenario", "Actual")];

        expect(availableAutomationParameters(stringCatalog, [], [], [], false)).toEqual([]);
    });

    it("includes a catalog STRING parameter in the available list when string parameters are enabled", () => {
        const stringCatalog = [workspaceStringParameter("scenario", "Scenario", "Actual")];

        expect(
            availableAutomationParameters(stringCatalog, [], [], [], true).map(
                (parameter) => parameter.ref.identifier,
            ),
        ).toEqual(["scenario"]);
    });

    it("omits parameters already present in the selected set", () => {
        const selected: IAutomationParameter[] = [
            {
                ref: idRef("topN", "parameter"),
                title: "Top N",
                value: 7,
                mode: "active",
                definition: { type: "NUMBER", defaultValue: 3 },
            },
        ];

        expect(
            availableAutomationParameters(catalog, selected, [], [], true).map(
                (parameter) => parameter.ref.identifier,
            ),
        ).toEqual(["limit"]);
    });

    it("seeds the addable value and title from the dashboard when the parameter is configured", () => {
        const dashboardParams = [dashboardParameter("topN", { value: 5, label: "Customer Top N" })];

        const addable = availableAutomationParameters(catalog, [], dashboardParams, [], true);

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

        const addable = availableAutomationParameters(catalog, [], dashboardParams, widgetValues, true);

        expect(addable.find((parameter) => parameter.ref.identifier === "topN")?.value).toBe(8);
        // "limit" has no widget-effective value → existing dashboard/workspace fallback applies
        expect(addable.find((parameter) => parameter.ref.identifier === "limit")?.value).toBe(50);
    });

    it("seeds a STRING parameter from the widget's effective string value", () => {
        const stringCatalog = [workspaceStringParameter("scenario", "Scenario", "Actual")];
        const widgetValues = [{ ref: idRef("scenario", "parameter"), value: "Budget" }];

        const addable = availableAutomationParameters(stringCatalog, [], [], widgetValues, true);

        expect(addable.find((parameter) => parameter.ref.identifier === "scenario")?.value).toBe("Budget");
    });

    it("recovers the workspace default when the effective value fails the definition's validity", () => {
        const stringCatalog = [workspaceStringParameter("scenario", "Scenario", "Actual")];
        // a numeric effective value cannot seed a STRING chip
        const mismatched = availableAutomationParameters(
            stringCatalog,
            [],
            [],
            [{ ref: idRef("scenario", "parameter"), value: 8 }],
            true,
        );
        expect(mismatched.find((parameter) => parameter.ref.identifier === "scenario")?.value).toBe("Actual");

        // an out-of-bounds numeric effective value recovers too, mirroring execution recovery
        const outOfRange = availableAutomationParameters(
            catalog,
            [],
            [],
            [{ ref: idRef("topN", "parameter"), value: 99 }],
            true,
        );
        expect(outOfRange.find((parameter) => parameter.ref.identifier === "topN")?.value).toBe(3);
    });

    it("omits parameters the dashboard author set to hidden", () => {
        const dashboardParams = [dashboardParameter("topN", { mode: "hidden" })];

        expect(
            availableAutomationParameters(catalog, [], dashboardParams, [], true).map(
                (parameter) => parameter.ref.identifier,
            ),
        ).toEqual(["limit"]);
    });

    it("omits parameters the dashboard author set to readonly", () => {
        const dashboardParams = [dashboardParameter("topN", { mode: "readonly" })];

        expect(
            availableAutomationParameters(catalog, [], dashboardParams, [], true).map(
                (parameter) => parameter.ref.identifier,
            ),
        ).toEqual(["limit"]);
    });
});

describe("reconstructAutomationParametersFromValues — reopen existing alert", () => {
    const catalog = [
        workspaceNumberParameter("topN", "Top N (workspace)", 3, { min: 1, max: 10 }),
        workspaceStringParameter("scenario", "Scenario (workspace)", "Actual"),
    ];

    it("derives title from the dashboard label, falling back to the workspace title", () => {
        const labelled = reconstructAutomationParametersFromValues(
            [{ ref: idRef("topN", "parameter"), value: 8 }],
            [dashboardParameter("topN", { mode: "readonly", label: "Customer Top N" })],
            catalog,
            true,
        );
        expect(labelled).toEqual([
            {
                ref: idRef("topN", "parameter"),
                title: "Customer Top N",
                value: 8,
                mode: "readonly",
                definition: { type: "NUMBER", defaultValue: 3, constraints: { min: 1, max: 10 } },
            },
        ]);

        const fallback = reconstructAutomationParametersFromValues(
            [{ ref: idRef("topN", "parameter"), value: 8 }],
            [dashboardParameter("topN")],
            catalog,
            true,
        );
        expect(fallback[0].title).toBe("Top N (workspace)");
    });

    it("keeps a STRING value row and carries the workspace definition", () => {
        const reconstructed = reconstructAutomationParametersFromValues(
            [{ ref: idRef("scenario", "parameter"), value: "Budget" }],
            [],
            catalog,
            true,
        );
        expect(reconstructed).toEqual([
            {
                ref: idRef("scenario", "parameter"),
                title: "Scenario (workspace)",
                value: "Budget",
                mode: "active",
                definition: { type: "STRING", defaultValue: "Actual" },
            },
        ]);
    });

    it("synthesizes a definition from the value when the ref left the catalog", () => {
        const reconstructed = reconstructAutomationParametersFromValues(
            [
                { ref: idRef("removedNumber", "parameter"), value: 8 },
                { ref: idRef("removedString", "parameter"), value: "Budget" },
            ],
            [],
            catalog,
            true,
        );
        expect(reconstructed).toEqual([
            {
                ref: idRef("removedNumber", "parameter"),
                title: "removedNumber",
                value: 8,
                mode: "active",
                definition: { type: "NUMBER", defaultValue: 8 },
            },
            {
                ref: idRef("removedString", "parameter"),
                title: "removedString",
                value: "Budget",
                mode: "active",
                definition: { type: "STRING", defaultValue: "Budget" },
            },
        ]);
    });

    it("drops an uncatalogued STRING value row when string parameters are gated off", () => {
        const reconstructed = reconstructAutomationParametersFromValues(
            [
                { ref: idRef("removedString", "parameter"), value: "Budget" },
                { ref: idRef("topN", "parameter"), value: 8 },
            ],
            [],
            catalog,
            false,
        );
        expect(reconstructed.map((parameter) => parameter.ref.identifier)).toEqual(["topN"]);
    });

    it("drops a row whose value type mismatches the catalog definition", () => {
        const reconstructed = reconstructAutomationParametersFromValues(
            [
                { ref: idRef("topN", "parameter"), value: "Budget" },
                { ref: idRef("scenario", "parameter"), value: 8 },
            ],
            [],
            catalog,
            true,
        );
        expect(reconstructed).toEqual([]);
    });
});

describe("reconstructAutomationParametersFromExportParameters — reopen existing export", () => {
    const catalog = [
        workspaceNumberParameter("topN", "Top N (workspace)", 3, { min: 1, max: 10 }),
        workspaceStringParameter("scenario", "Scenario (workspace)", "Actual"),
    ];

    it("parses the string wire value to a number and derives mode/definition from the dashboard/catalog", () => {
        const reconstructed = reconstructAutomationParametersFromExportParameters(
            [{ id: "topN", value: "8", title: "Top N (stored)", parameterType: "NUMBER" }],
            [dashboardParameter("topN", { mode: "readonly", label: "Customer Top N" })],
            catalog,
            true,
        );
        expect(reconstructed).toEqual([
            {
                ref: idRef("topN", "parameter"),
                title: "Customer Top N",
                value: 8,
                mode: "readonly",
                definition: { type: "NUMBER", defaultValue: 3, constraints: { min: 1, max: 10 } },
            },
        ]);
    });

    it("keeps a STRING parameter's wire value as a string chip", () => {
        const reconstructed = reconstructAutomationParametersFromExportParameters(
            [{ id: "scenario", value: "Budget", title: "Scenario (stored)", parameterType: "STRING" }],
            [],
            catalog,
            true,
        );
        expect(reconstructed).toEqual([
            {
                ref: idRef("scenario", "parameter"),
                title: "Scenario (workspace)",
                value: "Budget",
                mode: "active",
                definition: { type: "STRING", defaultValue: "Actual" },
            },
        ]);
    });

    it("drops entries whose wire value is not a finite number for a NUMBER parameter", () => {
        const reconstructed = reconstructAutomationParametersFromExportParameters(
            [
                { id: "topN", value: "not-a-number", title: "Top N", parameterType: "NUMBER" },
                { id: "topN", value: "5", title: "Top N", parameterType: "NUMBER" },
            ],
            [dashboardParameter("topN")],
            catalog,
            true,
        );
        expect(reconstructed.map((parameter) => parameter.value)).toEqual([5]);
    });
});

describe("automationParametersToExportParameters — chip set to wire", () => {
    it("encodes the value as a string and carries id + title", () => {
        const parameters: IAutomationParameter[] = [
            {
                ref: idRef("topN", "parameter"),
                title: "Top N",
                value: 8,
                mode: "active",
                definition: { type: "NUMBER", defaultValue: 3 },
            },
            {
                ref: idRef("limit", "parameter"),
                title: "Limit",
                value: 50,
                mode: "hidden",
                definition: { type: "NUMBER", defaultValue: 100 },
            },
            {
                ref: idRef("scenario", "parameter"),
                title: "Scenario",
                value: "Budget",
                mode: "active",
                definition: { type: "STRING", defaultValue: "Actual" },
            },
        ];
        expect(automationParametersToExportParameters(parameters)).toEqual([
            { id: "topN", value: "8", title: "Top N", parameterType: "NUMBER" },
            { id: "limit", value: "50", title: "Limit", parameterType: "NUMBER" },
            { id: "scenario", value: "Budget", title: "Scenario", parameterType: "STRING" },
        ]);
    });
});

describe("alert parameter staleness — detector and repairer share one predicate", () => {
    const catalog = [
        workspaceNumberParameter("topN", "Top N", 3),
        workspaceNumberParameter("limit", "Limit", 50),
    ];

    it("is not stale when there are no stored parameters", () => {
        expect(hasStaleAlertParameters(undefined, catalog)).toBe(false);
        expect(hasStaleAlertParameters([], catalog)).toBe(false);
    });

    it("is not stale when every stored ref is still in the workspace catalog", () => {
        expect(hasStaleAlertParameters([{ ref: idRef("topN", "parameter"), value: 8 }], catalog)).toBe(false);
    });

    it("is stale when a stored ref left the workspace catalog", () => {
        expect(
            hasStaleAlertParameters(
                [
                    { ref: idRef("topN", "parameter"), value: 8 },
                    { ref: idRef("removed", "parameter"), value: 1 },
                ],
                catalog,
            ),
        ).toBe(true);
    });

    it("drops exactly the catalog-absent refs the detector flags, keeping the present ones", () => {
        expect(
            dropStaleAlertParameters(
                [
                    { ref: idRef("topN", "parameter"), value: 8 },
                    { ref: idRef("removed", "parameter"), value: 1 },
                ],
                catalog,
            ),
        ).toEqual([{ ref: idRef("topN", "parameter"), value: 8 }]);
    });

    it("is stale when a stored STRING value's id was recreated as a NUMBER catalog parameter", () => {
        const recreatedCatalog = [
            workspaceNumberParameter("scenario", "Scenario", 1),
            workspaceNumberParameter("topN", "Top N", 3),
        ];
        const stored = [
            { ref: idRef("scenario", "parameter"), value: "Budget" },
            { ref: idRef("topN", "parameter"), value: 8 },
        ];

        expect(hasStaleAlertParameters(stored, recreatedCatalog)).toBe(true);
        expect(dropStaleAlertParameters(stored, recreatedCatalog)).toEqual([
            { ref: idRef("topN", "parameter"), value: 8 },
        ]);
    });

    it("is stale when a stored NUMBER value's id was recreated as a STRING catalog parameter", () => {
        const recreatedCatalog = [
            workspaceStringParameter("topN", "Top N", "Actual"),
            workspaceNumberParameter("limit", "Limit", 50),
        ];
        const stored = [
            { ref: idRef("topN", "parameter"), value: 8 },
            { ref: idRef("limit", "parameter"), value: 50 },
        ];

        expect(hasStaleAlertParameters(stored, recreatedCatalog)).toBe(true);
        expect(dropStaleAlertParameters(stored, recreatedCatalog)).toEqual([
            { ref: idRef("limit", "parameter"), value: 50 },
        ]);
    });

    it("is not stale when the stored value's kind matches its catalog parameter's type", () => {
        const stored = [
            { ref: idRef("topN", "parameter"), value: 8 },
            { ref: idRef("limit", "parameter"), value: 50 },
        ];

        expect(hasStaleAlertParameters(stored, catalog)).toBe(false);
        expect(dropStaleAlertParameters(stored, catalog)).toEqual(stored);
    });
});
