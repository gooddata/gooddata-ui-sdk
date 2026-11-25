// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { type AutomationAutomationAlert, type JsonApiAutomationOutList } from "@gooddata/api-client-tiger";
import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type IDashboardMeasureValueFilter,
    type IMeasureValueFilter,
    idRef,
    localIdRef,
    newAbsoluteGranularityDateFilter,
} from "@gooddata/sdk-model";

import {
    convertAlert,
    convertAutomationListToAutomations,
    convertExecutionFilterToFilterContextItem,
} from "./AutomationConverter.js";

describe("convertExecutionFilterToFilterContextItem — MVF branch", () => {
    const baseMvf = (overrides: Partial<IMeasureValueFilter["measureValueFilter"]>): IMeasureValueFilter => ({
        measureValueFilter: {
            measure: idRef("m1", "measure"),
            ...overrides,
        },
    });

    it("converts a comparison MVF with ObjRef measure", () => {
        const filter = baseMvf({
            localIdentifier: "mvf1",
            conditions: [{ comparison: { operator: "GREATER_THAN", value: 100 } }],
            dimensionality: [idRef("label.product")],
        });

        const result = convertExecutionFilterToFilterContextItem(filter, "fallback");

        expect(result).toEqual({
            dashboardMeasureValueFilter: {
                measure: idRef("m1", "measure"),
                localIdentifier: "mvf1",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 100 } }],
                dimensionality: [idRef("label.product")],
            },
        });
    });

    it("uses the fallback localIdentifier when source has none", () => {
        const filter = baseMvf({
            conditions: [{ comparison: { operator: "GREATER_THAN", value: 1 } }],
        });

        const result = convertExecutionFilterToFilterContextItem(filter, "legacy-mvf-7");
        expect((result as IDashboardMeasureValueFilter).dashboardMeasureValueFilter.localIdentifier).toBe(
            "legacy-mvf-7",
        );
    });

    it("is pure: same input + same fallback → same output", () => {
        const filter = baseMvf({});
        const a = convertExecutionFilterToFilterContextItem(filter, "legacy-mvf-0");
        const b = convertExecutionFilterToFilterContextItem(filter, "legacy-mvf-0");
        expect(a).toEqual(b);
    });

    it("propagates the `title` field when present at runtime", () => {
        const filter = {
            measureValueFilter: {
                measure: idRef("m1", "measure"),
                localIdentifier: "mvf1",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 10 } }],
                // Not on the official execution-side type, but kept defensively from richer sources.
                title: "Revenue > 10",
            },
        } as unknown as IMeasureValueFilter;

        const result = convertExecutionFilterToFilterContextItem(filter, "fallback");
        expect((result as IDashboardMeasureValueFilter).dashboardMeasureValueFilter.title).toBe(
            "Revenue > 10",
        );
    });

    it("omits the conditions field when the source has none (All)", () => {
        const filter = baseMvf({ localIdentifier: "mvf1" });
        const result = convertExecutionFilterToFilterContextItem(filter, "fallback");
        expect(result).toEqual({
            dashboardMeasureValueFilter: {
                measure: idRef("m1", "measure"),
                localIdentifier: "mvf1",
            },
        });
    });

    it("drops MVFs keyed by LocalIdRef and warns (dashboard MVF requires catalog ObjRef)", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const filter: IMeasureValueFilter = {
            measureValueFilter: {
                measure: localIdRef("local-m1"),
                localIdentifier: "mvf1",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 1 } }],
            },
        };

        const result = convertExecutionFilterToFilterContextItem(filter, "fallback");
        expect(result).toBeUndefined();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("LocalIdRef"), filter);
        warn.mockRestore();
    });
});

describe("convertExecutionFilterToFilterContextItem — absolute granularity date filter", () => {
    it("keeps the periods of a closed range", () => {
        const filter = newAbsoluteGranularityDateFilter(
            idRef("date", "dataSet"),
            "GDC.time.week",
            "2026-05",
            "2026-08",
            { localIdentifier: "date1", emptyValueHandling: "exclude" },
        );

        expect(convertExecutionFilterToFilterContextItem(filter, "fallback")).toEqual({
            dashboardAbsoluteGranularityDateFilter: {
                dataSet: idRef("date", "dataSet"),
                granularity: "GDC.time.week",
                from: "2026-05",
                to: "2026-08",
                localIdentifier: "date1",
                emptyValueHandling: "exclude",
            },
        });
    });

    it("keeps an open range open", () => {
        const filter = newAbsoluteGranularityDateFilter(
            idRef("date", "dataSet"),
            "GDC.time.year",
            undefined,
            "2026",
        );

        expect(convertExecutionFilterToFilterContextItem(filter, "fallback")).toEqual({
            dashboardAbsoluteGranularityDateFilter: {
                dataSet: idRef("date", "dataSet"),
                granularity: "GDC.time.year",
                to: "2026",
            },
        });
    });
});

describe("convertAlert (fromBackend) — parameters", () => {
    const baseAlert = (
        parameters?: AutomationAutomationAlert["execution"]["parameters"],
    ): AutomationAutomationAlert => ({
        execution: {
            attributes: [],
            measures: [],
            filters: [],
            ...(parameters ? { parameters } : {}),
        },
        condition: {
            comparison: { operator: "GREATER_THAN", left: { localIdentifier: "m1" }, right: { value: 5 } },
        },
        trigger: "ALWAYS",
    });

    it("maps AutomationParameterItem[] back to IInsightParameterValue[]", () => {
        const result = convertAlert(
            baseAlert([{ parameter: { identifier: { id: "topN", type: "parameter" } }, value: "5" }]),
        );

        expect(result?.execution.parameters).toEqual([{ ref: idRef("topN", "parameter"), value: "5" }]);
    });

    it("leaves parameters undefined when the backend sends none", () => {
        expect(convertAlert(baseAlert())?.execution.parameters).toBeUndefined();
    });

    it("passes every wire value through verbatim, numeric-looking and empty ones included", () => {
        const result = convertAlert(
            baseAlert([
                { parameter: { identifier: { id: "scenario", type: "parameter" } }, value: "Budget" },
                { parameter: { identifier: { id: "topN", type: "parameter" } }, value: "007" },
                { parameter: { identifier: { id: "note", type: "parameter" } }, value: "" },
            ]),
        );

        expect(result?.execution.parameters).toEqual([
            { ref: idRef("scenario", "parameter"), value: "Budget" },
            { ref: idRef("topN", "parameter"), value: "007" },
            { ref: idRef("note", "parameter"), value: "" },
        ]);
    });
});

describe("convertAlert (fromBackend) — execution settings", () => {
    const baseAlert = (timezone?: string): AutomationAutomationAlert => ({
        execution: {
            attributes: [],
            measures: [],
            filters: [],
        },
        condition: {
            comparison: { operator: "GREATER_THAN", left: { localIdentifier: "m1" }, right: { value: 5 } },
        },
        trigger: "ALWAYS",
        ...(timezone ? { settings: { timezone } } : {}),
    });

    it("maps the alert settings timezone back to execution.executionConfig", () => {
        expect(convertAlert(baseAlert("Europe/Prague"))?.execution.executionConfig).toEqual({
            timezone: "Europe/Prague",
        });
    });

    it("leaves executionConfig undefined when the backend sends no settings", () => {
        expect(convertAlert(baseAlert())?.execution.executionConfig).toBeUndefined();
    });
});

describe("convertAutomationListToAutomations", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const automation = (id: string, attributes: Record<string, unknown>) => ({
        id,
        type: "automation",
        attributes: { title: id, ...attributes },
        relationships: {},
    });

    const alertWithRange = (from: string, to: string) => ({
        alert: {
            execution: {
                attributes: [],
                measures: [],
                filters: [
                    {
                        absoluteGranularityDateFilter: {
                            dataset: { identifier: { id: "closed", type: "dataset" } },
                            granularity: "MONTH",
                            from,
                            to,
                        },
                    },
                ],
            },
            condition: {
                comparison: {
                    operator: "GREATER_THAN",
                    left: { localIdentifier: "m1" },
                    right: { value: 5 },
                },
            },
            trigger: "ALWAYS",
        },
    });

    const visualExportWithRange = (from: string, to: string) => ({
        visualExports: [
            {
                requestPayload: {
                    fileName: "export",
                    dashboardId: "dashboard-1",
                    metadata: {
                        filters: [
                            {
                                dashboardAbsoluteGranularityDateFilter: {
                                    granularity: "GDC.time.month",
                                    from,
                                    to,
                                },
                            },
                        ],
                    },
                },
            },
        ],
    });

    it.each([
        [
            "an invalid alert filter",
            alertWithRange("2026-03", "2026-04"),
            alertWithRange("2026-04", "2026-03"),
        ],
        [
            "an invalid filter context item",
            visualExportWithRange("2026-01", "2026-03"),
            visualExportWithRange("2026-03", "2026-01"),
        ],
    ])("skips an automation with %s and returns the others", (_desc, validAttributes, invalidAttributes) => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const automationList = {
            data: [automation("valid", validAttributes), automation("invalid", invalidAttributes)],
        } as unknown as JsonApiAutomationOutList;

        const automations = convertAutomationListToAutomations(automationList);

        expect(automations.map((a) => a.id)).toEqual(["valid"]);
        expect(warn).toHaveBeenCalledOnce();
        expect(warn).toHaveBeenCalledWith(
            "Automation cannot be loaded, skipping it:",
            "invalid",
            expect.any(NotSupported),
        );
    });
});
