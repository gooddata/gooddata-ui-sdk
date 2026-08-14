// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { withNormalization } from "@gooddata/sdk-backend-base";
import { compositeBackend, recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IDataView, type IExecutionResult } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDescriptor,
    type IDimensionDescriptor,
    type IMeasureDescriptor,
    type ISemanticConditionalFormatting,
    idRef,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    modifyMeasure,
} from "@gooddata/sdk-model";
import {
    DataViewFacade,
    type ITableAttributeColumnDefinition,
    type ITableAttributeHeaderValue,
    createIntlMock,
} from "@gooddata/sdk-ui";

import { type IConditionalFormatting } from "../../types/conditionalFormatting.js";
import { type AgGridRowData } from "../../types/internal.js";
import { type ColumnHeadersPosition } from "../../types/transposition.js";
import { type IPivotTableExecutionDefinitionParams, createExecutionDef } from "../data/createExecutionDef.js";
import { dataViewToColDefs } from "../data/dataViewToColDefs.js";
import { loadDataView } from "../data/loadDataView.js";

import {
    evaluateConditionalFormatting,
    resolveConditionalFormattingDateBounds,
    resolveConditionalFormattingTriggers,
} from "./conditionalFormatting.js";
import { resolvePerTargetConditionalFormatting } from "./semanticConditionalFormatting.js";

const RED = "#E54D40";

function buildAttributeDescriptor(
    localIdentifier: string,
    conditionalFormatting?: ISemanticConditionalFormatting,
): IAttributeDescriptor {
    return {
        attributeHeader: {
            uri: `/gdc/md/demo/obj/${localIdentifier}`,
            identifier: `${localIdentifier}.id`,
            localIdentifier,
            ref: idRef(`${localIdentifier}.id`),
            name: localIdentifier,
            formOf: {
                ref: idRef(`attr.${localIdentifier}`),
                uri: `/gdc/md/demo/obj/attr.${localIdentifier}`,
                identifier: `attr.${localIdentifier}`,
                name: localIdentifier,
            },
            primaryLabel: idRef(`${localIdentifier}.id`),
            ...(conditionalFormatting ? { conditionalFormatting } : {}),
        },
    };
}

function buildDateAttributeDescriptor(
    localIdentifier: string,
    granularity: string,
    conditionalFormatting?: ISemanticConditionalFormatting,
): IAttributeDescriptor {
    return {
        attributeHeader: {
            uri: `/gdc/md/demo/obj/${localIdentifier}`,
            identifier: `${localIdentifier}.id`,
            localIdentifier,
            ref: idRef(`${localIdentifier}.id`),
            name: localIdentifier,
            granularity,
            format: { locale: "en-US", pattern: "MMM y", timezone: "Europe/Prague" },
            formOf: {
                ref: idRef("attr.orderdate"),
                uri: "/gdc/md/demo/obj/attr.orderdate",
                identifier: "attr.orderdate",
                name: "Order date",
            },
            primaryLabel: idRef(`${localIdentifier}.id`),
            ...(conditionalFormatting ? { conditionalFormatting } : {}),
        },
    };
}

function buildMeasureDescriptor(
    localIdentifier: string,
    conditionalFormatting?: ISemanticConditionalFormatting,
): IMeasureDescriptor {
    return {
        measureHeaderItem: {
            localIdentifier,
            name: localIdentifier,
            format: "#,##0.00",
            ref: idRef(localIdentifier),
            ...(conditionalFormatting ? { conditionalFormatting } : {}),
        },
    };
}

function buildDateColumnDefinition(descriptor: IAttributeDescriptor): ITableAttributeColumnDefinition {
    return {
        type: "attribute",
        columnIndex: 0,
        rowHeaderIndex: 0,
        attributeDescriptor: descriptor,
    };
}

function buildDateCell(
    wireLabel: string | null,
    columnDefinition: ITableAttributeColumnDefinition,
): ITableAttributeHeaderValue {
    return {
        type: "attributeHeader",
        formattedValue: wireLabel === null ? "" : `Formatted ${wireLabel}`,
        value: {
            attributeHeaderItem: { name: wireLabel ?? "", uri: "/gdc/md/demo/obj/orderdate/elements?id=1" },
        },
        rowIndex: 0,
        columnIndex: 0,
        rowDefinition: { type: "value", rowIndex: 0, rowScope: [] },
        columnDefinition,
    };
}

describe("resolvePerTargetConditionalFormatting", () => {
    it("returns the exact same reference when no descriptor carries a semantic payload (freeze test)", () => {
        const insightConfig: IConditionalFormatting = {
            enabled: true,
            rules: [
                {
                    id: "r1",
                    target: { kind: "attribute", attributeIdentifier: "status" },
                    conditions: [],
                },
            ],
        };
        expect(
            resolvePerTargetConditionalFormatting(
                insightConfig,
                [buildAttributeDescriptor("status")],
                [buildMeasureDescriptor("amount")],
            ),
        ).toBe(insightConfig);

        expect(
            resolvePerTargetConditionalFormatting(undefined, [buildAttributeDescriptor("status")], []),
        ).toBeUndefined();
    });

    it("disabled: a Custom target's own rule doesn't apply, and does not fall back to its inherited rule", () => {
        // `enabled: false` only means "my authored rules are inactive" — it must not resurrect
        // inheritance for a target the creator explicitly customized (that's still Custom, just
        // with nothing active right now). Same target carries both an authored rule and a
        // semantic payload; disabled and the only target, so nothing should format at all.
        const semantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c1",
                    operator: "ALL",
                    value: { kind: "none" },
                    format: { backgroundColor: RED, scope: "cell" },
                },
            ],
        };
        const insightConfig: IConditionalFormatting = {
            enabled: false,
            rules: [
                {
                    id: "r1",
                    target: { kind: "attribute", attributeIdentifier: "status" },
                    conditions: [],
                },
            ],
        };

        const result = resolvePerTargetConditionalFormatting(
            insightConfig,
            [buildAttributeDescriptor("status", semantic)],
            [],
        );
        expect(result).toBeUndefined();
    });

    it("disabled: a target the creator never customized still inherits its semantic rule", () => {
        // The bug this guards against: disabling the insight's OWN rules must not blank out
        // formatting on unrelated, purely-inherited targets.
        const authoredTargetSemantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c-authored-target",
                    operator: "ALL",
                    value: { kind: "none" },
                    format: { backgroundColor: RED, scope: "cell" },
                },
            ],
        };
        const untouchedTargetSemantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c-untouched-target",
                    operator: "ALL",
                    value: { kind: "none" },
                    format: { backgroundColor: "#3DB36B", scope: "cell" },
                },
            ],
        };
        const insightConfig: IConditionalFormatting = {
            enabled: false,
            rules: [
                {
                    id: "r1",
                    target: { kind: "attribute", attributeIdentifier: "status" },
                    conditions: [],
                },
            ],
        };

        const result = resolvePerTargetConditionalFormatting(
            insightConfig,
            [
                buildAttributeDescriptor("status", authoredTargetSemantic),
                buildAttributeDescriptor("region", untouchedTargetSemantic),
            ],
            [],
        );
        expect(result?.enabled).toBe(true);
        expect(result?.rules).toEqual([
            {
                id: "semantic:attribute:region",
                target: { kind: "attribute", attributeIdentifier: "region" },
                conditions: untouchedTargetSemantic.conditions,
            },
        ]);
    });

    it("disabled: a customTargets suppression still applies (independent of the enabled toggle)", () => {
        const semantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c1",
                    operator: "ALL",
                    value: { kind: "none" },
                    format: { backgroundColor: RED, scope: "cell" },
                },
            ],
        };
        const insightConfig: IConditionalFormatting = {
            enabled: false,
            rules: [],
            customTargets: [{ kind: "attribute", attributeIdentifier: "status" }],
        };

        const result = resolvePerTargetConditionalFormatting(
            insightConfig,
            [buildAttributeDescriptor("status", semantic)],
            [],
        );
        expect(result).toBeUndefined();
    });

    it("synthesizes an enabled config from semantic rules alone when the insight has no config", () => {
        const semantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c1",
                    operator: "ALL",
                    value: { kind: "none" },
                    format: { backgroundColor: RED, scope: "cell" },
                },
            ],
        };

        const result = resolvePerTargetConditionalFormatting(
            undefined,
            [buildAttributeDescriptor("status", semantic)],
            [],
        );
        expect(result?.enabled).toBe(true);
        expect(result?.rules).toEqual([
            {
                id: "semantic:attribute:status",
                target: { kind: "attribute", attributeIdentifier: "status" },
                conditions: semantic.conditions,
            },
        ]);
    });

    it("materializes semantic rules from measure descriptors too", () => {
        const semantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c1",
                    operator: "LESS_THAN",
                    value: { kind: "literal", value: 0 },
                    format: { backgroundColor: RED, scope: "cell" },
                },
            ],
        };

        const result = resolvePerTargetConditionalFormatting(
            undefined,
            [],
            [buildMeasureDescriptor("variance", semantic)],
        );
        expect(result?.rules).toEqual([
            {
                id: "semantic:measure:variance",
                target: { kind: "measure", measureIdentifier: "variance" },
                conditions: semantic.conditions,
            },
        ]);
    });

    it("replacement: a target with an insight-authored rule ignores its semantic payload entirely", () => {
        const semantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c-semantic",
                    operator: "ALL",
                    value: { kind: "none" },
                    format: { backgroundColor: RED, scope: "cell" },
                },
            ],
        };
        const insightRule = {
            id: "r-insight",
            target: { kind: "attribute" as const, attributeIdentifier: "status" },
            conditions: [
                {
                    id: "c-insight",
                    operator: "EQUAL_TO" as const,
                    value: { kind: "literal" as const, value: "High risk" },
                    format: { backgroundColor: "#00C18D", scope: "cell" as const },
                },
            ],
        };
        const insightConfig: IConditionalFormatting = { enabled: true, rules: [insightRule] };

        const result = resolvePerTargetConditionalFormatting(
            insightConfig,
            [buildAttributeDescriptor("status", semantic)],
            [],
        );
        expect(result?.rules).toEqual([insightRule]);
    });

    it("suppression: a customTargets entry with no authored rule removes the semantic rule with nothing replacing it", () => {
        const semantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c1",
                    operator: "ALL",
                    value: { kind: "none" },
                    format: { backgroundColor: RED, scope: "cell" },
                },
            ],
        };
        const insightConfig: IConditionalFormatting = {
            enabled: true,
            rules: [],
            customTargets: [{ kind: "attribute", attributeIdentifier: "status" }],
        };

        const result = resolvePerTargetConditionalFormatting(
            insightConfig,
            [buildAttributeDescriptor("status", semantic)],
            [],
        );
        expect(result).toBeUndefined();
    });

    it("precedence: insight-authored rules always come before inherited rules in the merged array", () => {
        const semantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c-semantic",
                    operator: "ALL",
                    value: { kind: "none" },
                    format: { backgroundColor: RED, scope: "row" },
                },
            ],
        };
        const insightRule = {
            id: "r-insight",
            target: { kind: "attribute" as const, attributeIdentifier: "region" },
            conditions: [
                {
                    id: "c-insight",
                    operator: "ALL" as const,
                    value: { kind: "none" as const },
                    format: { backgroundColor: "#00C18D", scope: "row" as const },
                },
            ],
        };
        const insightConfig: IConditionalFormatting = { enabled: true, rules: [insightRule] };

        const result = resolvePerTargetConditionalFormatting(
            insightConfig,
            [buildAttributeDescriptor("status", semantic), buildAttributeDescriptor("region")],
            [],
        );
        expect(result?.rules[0].target).toEqual({ kind: "attribute", attributeIdentifier: "region" });
        expect(result?.rules[1].target).toEqual({ kind: "attribute", attributeIdentifier: "status" });
    });
});

describe("semantic date rules resolved through the unmodified engine", () => {
    const configForSemanticRule = (
        descriptor: IAttributeDescriptor,
        semantic: ISemanticConditionalFormatting,
    ): IConditionalFormatting => {
        const resolved = resolvePerTargetConditionalFormatting(
            undefined,
            [buildAttributeDescriptor(descriptor.attributeHeader.localIdentifier, semantic)],
            [],
        );
        if (!resolved) {
            throw new Error("expected a resolved config");
        }
        return resolved;
    };

    const paintsColumn = (
        config: IConditionalFormatting,
        columnDefinition: ITableAttributeColumnDefinition,
        colId: string,
        wireLabel: string | null,
    ): boolean => {
        const triggers = resolveConditionalFormattingTriggers(config, [columnDefinition], "top");
        const bounds = resolveConditionalFormattingDateBounds(config, [columnDefinition], {
            anchor: new Date(2023, 11, 15, 12),
        });
        const row: AgGridRowData = {
            cellDataByColId: { [colId]: buildDateCell(wireLabel, columnDefinition) },
            allRowData: [wireLabel],
        };
        return evaluateConditionalFormatting(config, triggers, row, colId, bounds) !== undefined;
    };

    it("one rule authored on a date dataset paints across Year/Quarter/Month/Date columns simultaneously", () => {
        const semantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c-date",
                    operator: "EQUAL_TO",
                    value: { kind: "relativeDate", granularity: "GDC.time.month", from: -1, to: 0 },
                    format: { backgroundColor: RED, scope: "cell" },
                },
            ],
        };

        const yearDescriptor = buildDateAttributeDescriptor("orderdate.year", "GDC.time.year");
        const quarterDescriptor = buildDateAttributeDescriptor("orderdate.quarter", "GDC.time.quarter");
        const monthDescriptor = buildDateAttributeDescriptor("orderdate.month", "GDC.time.month");
        const dateDescriptor = buildDateAttributeDescriptor("orderdate.date", "GDC.time.date");

        const yearConfig = configForSemanticRule(yearDescriptor, semantic);
        const quarterConfig = configForSemanticRule(quarterDescriptor, semantic);
        const monthConfig = configForSemanticRule(monthDescriptor, semantic);
        const dateConfig = configForSemanticRule(dateDescriptor, semantic);

        expect(
            paintsColumn(
                yearConfig,
                buildDateColumnDefinition(buildDateAttributeDescriptor("orderdate.year", "GDC.time.year")),
                "orderdate.year",
                "2023",
            ),
        ).toBe(true);
        expect(
            paintsColumn(
                quarterConfig,
                buildDateColumnDefinition(
                    buildDateAttributeDescriptor("orderdate.quarter", "GDC.time.quarter"),
                ),
                "orderdate.quarter",
                "2023-4",
            ),
        ).toBe(true);
        expect(
            paintsColumn(
                monthConfig,
                buildDateColumnDefinition(buildDateAttributeDescriptor("orderdate.month", "GDC.time.month")),
                "orderdate.month",
                "2023-12",
            ),
        ).toBe(true);
        expect(
            paintsColumn(
                dateConfig,
                buildDateColumnDefinition(buildDateAttributeDescriptor("orderdate.date", "GDC.time.date")),
                "orderdate.date",
                "2023-12-15",
            ),
        ).toBe(true);
        expect(
            paintsColumn(
                dateConfig,
                buildDateColumnDefinition(buildDateAttributeDescriptor("orderdate.date", "GDC.time.date")),
                "orderdate.date",
                "2024-01-05",
            ),
        ).toBe(false);
    });

    it("'is not on Mar 1 - Jul 31' over quarter columns paints only Q4", () => {
        const semantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c-date",
                    operator: "NOT_EQUAL_TO",
                    value: { kind: "absoluteDate", from: "2023-03-01", to: "2023-07-31" },
                    format: { backgroundColor: RED, scope: "cell" },
                },
            ],
        };
        const quarterDescriptor = buildDateAttributeDescriptor("orderdate.quarter", "GDC.time.quarter");
        const config = configForSemanticRule(quarterDescriptor, semantic);
        const columnDefinition = buildDateColumnDefinition(quarterDescriptor);

        expect(paintsColumn(config, columnDefinition, "orderdate.quarter", "2023-1")).toBe(false);
        expect(paintsColumn(config, columnDefinition, "orderdate.quarter", "2023-2")).toBe(false);
        expect(paintsColumn(config, columnDefinition, "orderdate.quarter", "2023-3")).toBe(false);
        expect(paintsColumn(config, columnDefinition, "orderdate.quarter", "2023-4")).toBe(true);
    });

    it("a period spanning Dec 29 - Jan 4 paints both year columns it touches", () => {
        const semantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c-date",
                    operator: "EQUAL_TO",
                    value: { kind: "absoluteDate", from: "2025-12-29", to: "2026-01-04" },
                    format: { backgroundColor: RED, scope: "cell" },
                },
            ],
        };
        const yearDescriptor = buildDateAttributeDescriptor("orderdate.year", "GDC.time.year");
        const config = configForSemanticRule(yearDescriptor, semantic);
        const columnDefinition = buildDateColumnDefinition(yearDescriptor);

        expect(paintsColumn(config, columnDefinition, "orderdate.year", "2025")).toBe(true);
        expect(paintsColumn(config, columnDefinition, "orderdate.year", "2026")).toBe(true);
        expect(paintsColumn(config, columnDefinition, "orderdate.year", "2024")).toBe(false);
        expect(paintsColumn(config, columnDefinition, "orderdate.year", "2027")).toBe(false);
    });
});

describe("resolvePerTargetConditionalFormatting wired into dataViewToColDefs (end-to-end)", () => {
    const workspace = "reference-workspace";
    const backend = compositeBackend({
        workspace,
        backend: withNormalization(recordedBackend(ReferenceRecordings.Recordings)),
    });

    const testAmount = modifyMeasure(ReferenceMd.Amount, (m) => m.localId("amount.semantic-cf-test"));

    function shallowCloneWithOverride<T extends object>(source: T, override: Partial<T>): T {
        // oxlint-disable-next-line typescript-eslint/no-unsafe-argument, typescript-eslint/no-unsafe-return -- Object.create returns any; this preserves source's prototype methods.
        return Object.assign(Object.create(Object.getPrototypeOf(source)), source, override);
    }

    function injectConditionalFormatting(
        dataView: IDataView,
        localIdentifier: string,
        conditionalFormatting: ISemanticConditionalFormatting,
    ): IDataView {
        const dimensions: IDimensionDescriptor[] = dataView.result.dimensions.map((dimension) => ({
            ...dimension,
            headers: dimension.headers.map((header) => {
                if (isMeasureGroupDescriptor(header)) {
                    return {
                        measureGroupHeader: {
                            ...header.measureGroupHeader,
                            items: header.measureGroupHeader.items.map((measure) =>
                                measure.measureHeaderItem.localIdentifier === localIdentifier
                                    ? {
                                          measureHeaderItem: {
                                              ...measure.measureHeaderItem,
                                              conditionalFormatting,
                                          },
                                      }
                                    : measure,
                            ),
                        },
                    };
                }
                if (
                    isAttributeDescriptor(header) &&
                    header.attributeHeader.localIdentifier === localIdentifier
                ) {
                    return { attributeHeader: { ...header.attributeHeader, conditionalFormatting } };
                }
                return header;
            }),
        }));
        const result = shallowCloneWithOverride<IExecutionResult>(dataView.result, { dimensions });
        return shallowCloneWithOverride<IDataView>(dataView, { result });
    }

    it("paints a cell whose semantic payload rides the real execution result headers", async () => {
        const params: IPivotTableExecutionDefinitionParams & {
            columnHeadersPosition: ColumnHeadersPosition;
        } = {
            workspace,
            columns: [],
            rows: [],
            measures: [testAmount],
            filters: [],
            sortBy: [],
            totals: [],
            measureGroupDimension: "columns",
            columnHeadersPosition: "top",
            execConfig: {},
        };
        const executionDefinition = createExecutionDef(params);
        const executionResult = await backend
            .workspace(workspace)
            .execution()
            .forDefinition(executionDefinition)
            .execute();
        const realDataView = await loadDataView({ executionResult, startRow: 0, endRow: 100 });

        const baseline = dataViewToColDefs({
            dataView: realDataView,
            columnHeadersPosition: "top",
            columnWidths: [],
            drillableItemsRef: { current: [] },
            textWrapping: {},
            intl: createIntlMock(),
        });
        const baselineAmountColDef = baseline.columnDefsFlat.find((colDef) =>
            colDef.colId?.includes("amount.semantic-cf-test"),
        );

        const semantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c1",
                    operator: "ALL",
                    value: { kind: "none" },
                    format: { backgroundColor: RED, scope: "cell" },
                },
            ],
        };
        const injectedDataView = injectConditionalFormatting(
            realDataView.dataView,
            "amount.semantic-cf-test",
            semantic,
        );
        const dataView = DataViewFacade.for(injectedDataView);

        const { columnDefsFlat } = dataViewToColDefs({
            dataView,
            columnHeadersPosition: "top",
            columnWidths: [],
            drillableItemsRef: { current: [] },
            textWrapping: {},
            intl: createIntlMock(),
            enableSemanticConditionalFormatting: true,
        });

        const amountColDef = columnDefsFlat.find((colDef) =>
            colDef.colId?.includes("amount.semantic-cf-test"),
        );
        expect(amountColDef).toBeDefined();
        expect(typeof amountColDef?.cellStyle).toBe("function");
        expect(amountColDef?.cellStyle).not.toBe(baselineAmountColDef?.cellStyle);
    });

    it("does not inherit when enableSemanticConditionalFormatting is off, even with a semantic payload present", async () => {
        const params: IPivotTableExecutionDefinitionParams & {
            columnHeadersPosition: ColumnHeadersPosition;
        } = {
            workspace,
            columns: [],
            rows: [],
            measures: [testAmount],
            filters: [],
            sortBy: [],
            totals: [],
            measureGroupDimension: "columns",
            columnHeadersPosition: "top",
            execConfig: {},
        };
        const executionDefinition = createExecutionDef(params);
        const executionResult = await backend
            .workspace(workspace)
            .execution()
            .forDefinition(executionDefinition)
            .execute();
        const realDataView = await loadDataView({ executionResult, startRow: 0, endRow: 100 });

        const baseline = dataViewToColDefs({
            dataView: realDataView,
            columnHeadersPosition: "top",
            columnWidths: [],
            drillableItemsRef: { current: [] },
            textWrapping: {},
            intl: createIntlMock(),
        });
        const baselineAmountColDef = baseline.columnDefsFlat.find((colDef) =>
            colDef.colId?.includes("amount.semantic-cf-test"),
        );

        const semantic: ISemanticConditionalFormatting = {
            conditions: [
                {
                    id: "c1",
                    operator: "ALL",
                    value: { kind: "none" },
                    format: { backgroundColor: RED, scope: "cell" },
                },
            ],
        };
        const injectedDataView = injectConditionalFormatting(
            realDataView.dataView,
            "amount.semantic-cf-test",
            semantic,
        );
        const dataView = DataViewFacade.for(injectedDataView);

        const { columnDefsFlat } = dataViewToColDefs({
            dataView,
            columnHeadersPosition: "top",
            columnWidths: [],
            drillableItemsRef: { current: [] },
            textWrapping: {},
            intl: createIntlMock(),
            // enableSemanticConditionalFormatting deliberately omitted (defaults to off).
        });

        const amountColDef = columnDefsFlat.find((colDef) =>
            colDef.colId?.includes("amount.semantic-cf-test"),
        );
        expect(amountColDef?.cellStyle).toBe(baselineAmountColDef?.cellStyle);
    });
});
