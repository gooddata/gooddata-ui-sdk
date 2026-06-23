// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IAttributeDescriptor,
    type IMeasureDescriptor,
    type IMeasureGroupDescriptor,
    type IResultMeasureHeader,
    idRef,
} from "@gooddata/sdk-model";
import {
    type ITableAttributeColumnDefinition,
    type ITableAttributeHeaderValue,
    type ITableMeasureGroupValueColumnDefinition,
    type ITableMeasureValue,
    type ITableValueColumnDefinition,
} from "@gooddata/sdk-ui";

import {
    type ConditionalFormattingOperator,
    type ConditionalFormattingValue,
    type IConditionalFormatting,
    type IConditionalFormattingRule,
} from "../../types/conditionalFormatting.js";
import { type AgGridRowData } from "../../types/internal.js";

import {
    evaluateConditionalFormatting,
    resolveConditionalFormattingTriggers,
} from "./conditionalFormatting.js";

const STATUS_COL_ID = "status";
const VARIANCE_COL_ID = "variance";
const STATUS_ATTR_ID = "status";
const VARIANCE_MEASURE_ID = "variance";
const RED = "#E54D40";
const GREEN = "#00C18D";

// In these fixtures the only measure maps to the variance column and the only attribute to the
// status column, so trigger resolution (verified separately) reduces to this.
const triggersFor = (cfg: IConditionalFormatting): (readonly string[])[] =>
    cfg.rules.map((rule) => [rule.target.kind === "measure" ? VARIANCE_COL_ID : STATUS_COL_ID]);

describe("evaluateConditionalFormatting", () => {
    const cellRuleVarianceLt: IConditionalFormattingRule = {
        id: "r-variance",
        target: { kind: "measure", measureIdentifier: VARIANCE_MEASURE_ID },
        conditions: [
            {
                id: "c1",
                operator: "LESS_THAN",
                value: { kind: "literal", value: -10 },
                format: { backgroundColor: RED, scope: "cell" },
            },
        ],
    };

    const rowRuleStatusHighRisk: IConditionalFormattingRule = {
        id: "r-status",
        target: { kind: "attribute", attributeIdentifier: STATUS_ATTR_ID },
        conditions: [
            {
                id: "c1",
                operator: "EQUAL_TO",
                value: { kind: "literal", value: "High risk" },
                format: { backgroundColor: RED, scope: "row" },
            },
        ],
    };

    it("cell-scope numeric rule paints only the trigger measure cell", () => {
        const row = buildRow({ status: "High risk", variance: -24 });
        const config: IConditionalFormatting = { enabled: true, rules: [cellRuleVarianceLt] };

        expect(evaluateConditionalFormatting(config, triggersFor(config), row, VARIANCE_COL_ID)).toEqual({
            backgroundColor: RED,
        });
        expect(
            evaluateConditionalFormatting(config, triggersFor(config), row, STATUS_COL_ID),
        ).toBeUndefined();
    });

    it("row-scope rule paints the whole row INCLUDING the attribute/row-header cell", () => {
        const row = buildRow({ status: "High risk", variance: -24 });
        const config: IConditionalFormatting = { enabled: true, rules: [rowRuleStatusHighRisk] };

        // The headline proof: a rule keyed on the Status column paints the Variance cell too...
        expect(evaluateConditionalFormatting(config, triggersFor(config), row, VARIANCE_COL_ID)).toEqual({
            backgroundColor: RED,
        });
        // ...and the row-header (attribute) cell, which has no measure value of its own.
        expect(evaluateConditionalFormatting(config, triggersFor(config), row, STATUS_COL_ID)).toEqual({
            backgroundColor: RED,
        });
    });

    it("does not paint when nothing matches", () => {
        const row = buildRow({ status: "Low", variance: 5 });
        const config: IConditionalFormatting = {
            enabled: true,
            rules: [cellRuleVarianceLt, rowRuleStatusHighRisk],
        };

        expect(
            evaluateConditionalFormatting(config, triggersFor(config), row, VARIANCE_COL_ID),
        ).toBeUndefined();
        expect(
            evaluateConditionalFormatting(config, triggersFor(config), row, STATUS_COL_ID),
        ).toBeUndefined();
    });

    it("first-match-wins by rule order: an earlier row rule shadows a later cell rule on the shared column", () => {
        const row = buildRow({ status: "High risk", variance: -24 });
        const greenRow: IConditionalFormattingRule = {
            ...rowRuleStatusHighRisk,
            conditions: [
                { ...rowRuleStatusHighRisk.conditions[0], format: { backgroundColor: GREEN, scope: "row" } },
            ],
        };
        // Row rule listed first and matching paints the whole row — including the variance cell that the
        // later cell rule targets. Order decides, not scope.
        const config: IConditionalFormatting = { enabled: true, rules: [greenRow, cellRuleVarianceLt] };

        expect(evaluateConditionalFormatting(config, triggersFor(config), row, VARIANCE_COL_ID)).toEqual({
            backgroundColor: GREEN,
        });
        expect(evaluateConditionalFormatting(config, triggersFor(config), row, STATUS_COL_ID)).toEqual({
            backgroundColor: GREEN,
        });
    });

    it("text comparison is case-insensitive", () => {
        const row = buildRow({ status: "HIGH RISK", variance: 5 });
        const config: IConditionalFormatting = { enabled: true, rules: [rowRuleStatusHighRisk] };

        expect(evaluateConditionalFormatting(config, triggersFor(config), row, STATUS_COL_ID)).toEqual({
            backgroundColor: RED,
        });
    });

    it("empty cells match only IS_EMPTY, never numeric comparisons", () => {
        const row = buildRow({ status: "High risk", variance: null });

        const ltRule: IConditionalFormatting = { enabled: true, rules: [cellRuleVarianceLt] };
        expect(
            evaluateConditionalFormatting(ltRule, triggersFor(ltRule), row, VARIANCE_COL_ID),
        ).toBeUndefined();

        const emptyRule: IConditionalFormatting = {
            enabled: true,
            rules: [
                {
                    id: "r-empty",
                    target: { kind: "measure", measureIdentifier: VARIANCE_MEASURE_ID },
                    conditions: [
                        {
                            id: "c1",
                            operator: "IS_EMPTY",
                            value: { kind: "none" },
                            format: { backgroundColor: RED, scope: "cell" },
                        },
                    ],
                },
            ],
        };
        expect(
            evaluateConditionalFormatting(emptyRule, triggersFor(emptyRule), row, VARIANCE_COL_ID),
        ).toEqual({ backgroundColor: RED });
    });

    it("returns undefined when the feature is disabled", () => {
        const row = buildRow({ status: "High risk", variance: -24 });
        const config: IConditionalFormatting = {
            enabled: false,
            rules: [cellRuleVarianceLt, rowRuleStatusHighRisk],
        };

        expect(
            evaluateConditionalFormatting(config, triggersFor(config), row, VARIANCE_COL_ID),
        ).toBeUndefined();
    });
});

describe("resolveConditionalFormattingTriggers", () => {
    const columnDefinitions = [buildAttributeColumnDefinition(), buildValueColumnDefinition()];

    it("resolves each rule's target to a colId, undefined when the target is absent", () => {
        const config: IConditionalFormatting = {
            enabled: true,
            rules: [
                {
                    id: "m",
                    target: { kind: "measure", measureIdentifier: VARIANCE_MEASURE_ID },
                    conditions: [],
                },
                {
                    id: "a",
                    target: { kind: "attribute", attributeIdentifier: STATUS_ATTR_ID },
                    conditions: [],
                },
                { id: "x", target: { kind: "measure", measureIdentifier: "does_not_exist" }, conditions: [] },
            ],
        };

        const triggers = resolveConditionalFormattingTriggers(config, columnDefinitions, "top");

        expect(triggers[0]).toHaveLength(1); // measure column found
        expect(triggers[1]).toHaveLength(1); // attribute column found
        expect(triggers[0]).not.toEqual(triggers[1]);
        expect(triggers[2]).toEqual([]); // missing column → no candidates
    });

    it("resolved colId matches the key a row actually carries — paints end-to-end", () => {
        // Ties the two test universes together: resolve the trigger with the REAL resolver, then key
        // the row by that resolved colId (not a synthetic literal). If trigger resolution and cell
        // keying ever diverge (e.g. a mismatched columnHeadersPosition), this fails instead of
        // silently rendering nothing.
        const config: IConditionalFormatting = {
            enabled: true,
            rules: [
                {
                    id: "m",
                    target: { kind: "measure", measureIdentifier: VARIANCE_MEASURE_ID },
                    conditions: [
                        {
                            id: "c1",
                            operator: "LESS_THAN",
                            value: { kind: "literal", value: -10 },
                            format: { backgroundColor: RED, scope: "cell" },
                        },
                    ],
                },
            ],
        };

        const triggers = resolveConditionalFormattingTriggers(config, columnDefinitions, "top");
        const measureColId = triggers[0]?.[0];
        if (measureColId === undefined) {
            throw new Error("expected the measure rule to resolve to a colId");
        }

        const row: AgGridRowData = {
            cellDataByColId: { [measureColId]: buildMeasureCell(-24) },
            allRowData: [-24],
        };

        expect(evaluateConditionalFormatting(config, triggers, row, measureColId)).toEqual({
            backgroundColor: RED,
        });
    });
});

describe("transposed measures (measures in rows)", () => {
    // When measures are transposed into rows there is no per-measure column: every measure shares
    // the single measureGroupValue column, one measure per row. The measure rule resolves to that
    // shared column, and the per-cell measure gate paints ONLY the rows whose measure is the target.
    const AMOUNT_MEASURE_ID = "amount";
    const columnDefinitions = [buildAttributeColumnDefinition(), buildMeasureGroupValueColumnDefinition()];

    const config: IConditionalFormatting = {
        enabled: true,
        rules: [
            {
                id: "r",
                target: { kind: "measure", measureIdentifier: VARIANCE_MEASURE_ID },
                conditions: [
                    {
                        id: "c",
                        operator: "LESS_THAN",
                        value: { kind: "literal", value: 0 },
                        format: { backgroundColor: RED, scope: "cell" },
                    },
                ],
            },
        ],
    };

    it("resolves a measure target to the shared measureGroupValue column", () => {
        const triggers = resolveConditionalFormattingTriggers(config, columnDefinitions, "top");
        expect(triggers[0]).toEqual([expect.any(String)]);
    });

    it("paints the target measure's row but not another measure's row with the same value", () => {
        const triggers = resolveConditionalFormattingTriggers(config, columnDefinitions, "top");
        const valueColId = triggers[0]?.[0];
        if (valueColId === undefined) {
            throw new Error("expected the transposed measure rule to resolve to a colId");
        }

        const varianceRow: AgGridRowData = {
            cellDataByColId: { [valueColId]: buildTransposedMeasureCell(-24, VARIANCE_MEASURE_ID) },
            allRowData: [-24],
        };
        const amountRow: AgGridRowData = {
            cellDataByColId: { [valueColId]: buildTransposedMeasureCell(-24, AMOUNT_MEASURE_ID) },
            allRowData: [-24],
        };

        // The variance row matches and paints...
        expect(evaluateConditionalFormatting(config, triggers, varianceRow, valueColId)).toEqual({
            backgroundColor: RED,
        });
        // ...the amount row carries the same -24 in the shared column but is a different measure, so
        // the rule's row-measure gate skips it.
        expect(evaluateConditionalFormatting(config, triggers, amountRow, valueColId)).toBeUndefined();
    });
});

describe("pivoted measures (one measure across several column groups)", () => {
    // A column attribute (Region: East/West) pivots Variance into two value columns. A measure rule
    // resolves to BOTH; each pivot cell is evaluated on its own value (cell scope), and a row paints
    // if ANY of the measure's pivot cells matches (row scope). The same scope-membership model that
    // serves non-pivoted handles this with no extra branch.
    const EAST = "/gdc/md/demo/obj/region/elements?id=1";
    const WEST = "/gdc/md/demo/obj/region/elements?id=2";
    const columnDefinitions = [
        buildAttributeColumnDefinition(),
        buildPivotedValueColumnDefinition(EAST),
        buildPivotedValueColumnDefinition(WEST),
    ];

    const negativeRule = (scope: "cell" | "row"): IConditionalFormatting => ({
        enabled: true,
        rules: [
            {
                id: "r",
                target: { kind: "measure", measureIdentifier: VARIANCE_MEASURE_ID },
                conditions: [
                    {
                        id: "c",
                        operator: "LESS_THAN",
                        value: { kind: "literal", value: 0 },
                        format: { backgroundColor: RED, scope },
                    },
                ],
            },
        ],
    });

    it("resolves a measure target to every pivot-group column", () => {
        const triggers = resolveConditionalFormattingTriggers(negativeRule("cell"), columnDefinitions, "top");
        expect(triggers[0]).toHaveLength(2);
    });

    it("cell scope paints each pivot cell independently on its own value", () => {
        const config = negativeRule("cell");
        const triggers = resolveConditionalFormattingTriggers(config, columnDefinitions, "top");
        const [eastColId, westColId] = triggers[0];
        const row: AgGridRowData = {
            cellDataByColId: {
                [eastColId]: buildPivotedMeasureCell(-5, buildPivotedValueColumnDefinition(EAST)),
                [westColId]: buildPivotedMeasureCell(3, buildPivotedValueColumnDefinition(WEST)),
            },
            allRowData: [-5, 3],
        };
        // East is negative -> painted; West is positive -> not. Each pivot group stands alone.
        expect(evaluateConditionalFormatting(config, triggers, row, eastColId)).toEqual({
            backgroundColor: RED,
        });
        expect(evaluateConditionalFormatting(config, triggers, row, westColId)).toBeUndefined();
    });

    it("row scope paints the whole row when ANY pivot-group cell of the measure matches", () => {
        const config = negativeRule("row");
        const triggers = resolveConditionalFormattingTriggers(config, columnDefinitions, "top");
        const [eastColId, westColId] = triggers[0];
        const row: AgGridRowData = {
            cellDataByColId: {
                [eastColId]: buildPivotedMeasureCell(-5, buildPivotedValueColumnDefinition(EAST)),
                [westColId]: buildPivotedMeasureCell(3, buildPivotedValueColumnDefinition(WEST)),
            },
            allRowData: [-5, 3],
        };
        // The West cell is +3 (wouldn't match alone), but East matched, and row scope paints the
        // whole row — so even the West cell is painted.
        expect(evaluateConditionalFormatting(config, triggers, row, westColId)).toEqual({
            backgroundColor: RED,
        });
    });
});

describe("transposed + pivoted measures (measures in rows, attribute in columns)", () => {
    // The hardest layout: the value lives in transposed value columns (one per column group), and the
    // ROW selects the measure. A measure rule must resolve to every column group and paint only its
    // own measure's rows — column membership and row membership both handled by the one scope test.
    const AMOUNT_MEASURE_ID = "amount";
    const EAST = "/gdc/md/demo/obj/region/elements?id=1";
    const WEST = "/gdc/md/demo/obj/region/elements?id=2";
    const columnDefinitions = [
        buildAttributeColumnDefinition(),
        buildTransposedPivotedValueColumnDefinition(EAST),
        buildTransposedPivotedValueColumnDefinition(WEST),
    ];

    const config: IConditionalFormatting = {
        enabled: true,
        rules: [
            {
                id: "r",
                target: { kind: "measure", measureIdentifier: VARIANCE_MEASURE_ID },
                conditions: [
                    {
                        id: "c",
                        operator: "LESS_THAN",
                        value: { kind: "literal", value: 0 },
                        format: { backgroundColor: RED, scope: "cell" },
                    },
                ],
            },
        ],
    };

    it("resolves to every column group (the measure is selected per row, not per column)", () => {
        const triggers = resolveConditionalFormattingTriggers(config, columnDefinitions, "top");
        expect(triggers[0]).toHaveLength(2);
    });

    it("paints the target measure's row across all column groups, never another measure's row", () => {
        const triggers = resolveConditionalFormattingTriggers(config, columnDefinitions, "top");
        const [eastColId, westColId] = triggers[0];

        const varianceRow: AgGridRowData = {
            cellDataByColId: {
                [eastColId]: buildPivotedMeasureCell(
                    -5,
                    buildTransposedPivotedValueColumnDefinition(EAST),
                    VARIANCE_MEASURE_ID,
                ),
                [westColId]: buildPivotedMeasureCell(
                    -2,
                    buildTransposedPivotedValueColumnDefinition(WEST),
                    VARIANCE_MEASURE_ID,
                ),
            },
            allRowData: [-5, -2],
        };
        const amountRow: AgGridRowData = {
            cellDataByColId: {
                [eastColId]: buildPivotedMeasureCell(
                    -5,
                    buildTransposedPivotedValueColumnDefinition(EAST),
                    AMOUNT_MEASURE_ID,
                ),
                [westColId]: buildPivotedMeasureCell(
                    -2,
                    buildTransposedPivotedValueColumnDefinition(WEST),
                    AMOUNT_MEASURE_ID,
                ),
            },
            allRowData: [-5, -2],
        };

        // Variance row: both pivot cells are negative -> both painted.
        expect(evaluateConditionalFormatting(config, triggers, varianceRow, eastColId)).toEqual({
            backgroundColor: RED,
        });
        expect(evaluateConditionalFormatting(config, triggers, varianceRow, westColId)).toEqual({
            backgroundColor: RED,
        });
        // Amount row: same negative values, but a different measure -> the per-row gate skips it.
        expect(evaluateConditionalFormatting(config, triggers, amountRow, eastColId)).toBeUndefined();
        expect(evaluateConditionalFormatting(config, triggers, amountRow, westColId)).toBeUndefined();
    });
});

describe("numeric range and boundary semantics", () => {
    const measureRuleConfig = (
        operator: ConditionalFormattingOperator,
        value: ConditionalFormattingValue,
    ): IConditionalFormatting => ({
        enabled: true,
        rules: [
            {
                id: "r",
                target: { kind: "measure", measureIdentifier: VARIANCE_MEASURE_ID },
                conditions: [{ id: "c", operator, value, format: { backgroundColor: RED, scope: "cell" } }],
            },
        ],
    });

    const paints = (config: IConditionalFormatting, variance: number): boolean =>
        evaluateConditionalFormatting(
            config,
            triggersFor(config),
            buildRow({ status: "x", variance }),
            VARIANCE_COL_ID,
        ) !== undefined;

    it("BETWEEN is inclusive of both bounds", () => {
        const cfg = measureRuleConfig("BETWEEN", { kind: "literalRange", from: 10, to: 20 });
        expect(paints(cfg, 10)).toBe(true); // lower bound included
        expect(paints(cfg, 20)).toBe(true); // upper bound included
        expect(paints(cfg, 15)).toBe(true);
        expect(paints(cfg, 9)).toBe(false);
        expect(paints(cfg, 21)).toBe(false);
    });

    it("treats a backwards range (from > to) as the same interval", () => {
        const between = measureRuleConfig("BETWEEN", { kind: "literalRange", from: 20, to: 10 });
        expect(paints(between, 15)).toBe(true);
        expect(paints(between, 25)).toBe(false);
        const notBetween = measureRuleConfig("NOT_BETWEEN", { kind: "literalRange", from: 20, to: 10 });
        expect(paints(notBetween, 15)).toBe(false);
        expect(paints(notBetween, 25)).toBe(true);
    });

    it("LESS_THAN excludes the threshold; LESS_THAN_OR_EQUAL_TO includes it (same for GREATER_THAN)", () => {
        expect(paints(measureRuleConfig("LESS_THAN", { kind: "literal", value: 5 }), 5)).toBe(false);
        expect(paints(measureRuleConfig("LESS_THAN_OR_EQUAL_TO", { kind: "literal", value: 5 }), 5)).toBe(
            true,
        );
        expect(paints(measureRuleConfig("GREATER_THAN", { kind: "literal", value: 5 }), 5)).toBe(false);
        expect(paints(measureRuleConfig("GREATER_THAN_OR_EQUAL_TO", { kind: "literal", value: 5 }), 5)).toBe(
            true,
        );
    });
});

describe("evaluateConditionalFormatting — review-fix regressions", () => {
    // #1 — IS_EMPTY/IS_NOT_EMPTY on an attribute column (was inverted: isEmptyCell excluded attributes).
    it("IS_EMPTY matches an empty attribute cell; IS_NOT_EMPTY does not", () => {
        const row = buildRow({ status: "", variance: 5 });
        const isEmpty: IConditionalFormatting = {
            enabled: true,
            rules: [
                {
                    id: "r",
                    target: { kind: "attribute", attributeIdentifier: STATUS_ATTR_ID },
                    conditions: [
                        {
                            id: "c",
                            operator: "IS_EMPTY",
                            value: { kind: "none" },
                            format: { backgroundColor: RED, scope: "cell" },
                        },
                    ],
                },
            ],
        };
        expect(evaluateConditionalFormatting(isEmpty, triggersFor(isEmpty), row, STATUS_COL_ID)).toEqual({
            backgroundColor: RED,
        });

        const isNotEmpty: IConditionalFormatting = {
            enabled: true,
            rules: [
                {
                    id: "r",
                    target: { kind: "attribute", attributeIdentifier: STATUS_ATTR_ID },
                    conditions: [
                        {
                            id: "c",
                            operator: "IS_NOT_EMPTY",
                            value: { kind: "none" },
                            format: { backgroundColor: RED, scope: "cell" },
                        },
                    ],
                },
            ],
        };
        expect(
            evaluateConditionalFormatting(isNotEmpty, triggersFor(isNotEmpty), row, STATUS_COL_ID),
        ).toBeUndefined();
    });

    // #4 — a real 0 that a "hide zeros" format renders as "" must NOT be treated as empty.
    it("a 0 rendered as '' is not treated as empty by numeric operators", () => {
        const row: AgGridRowData = {
            cellDataByColId: {
                [STATUS_COL_ID]: buildAttributeCell("X"),
                [VARIANCE_COL_ID]: buildMeasureCell(0, { formattedValue: "" }),
            },
            allRowData: ["X", 0],
        };
        const config: IConditionalFormatting = {
            enabled: true,
            rules: [
                {
                    id: "r",
                    target: { kind: "measure", measureIdentifier: VARIANCE_MEASURE_ID },
                    conditions: [
                        {
                            id: "c",
                            operator: "LESS_THAN",
                            value: { kind: "literal", value: 5 },
                            format: { backgroundColor: RED, scope: "cell" },
                        },
                    ],
                },
            ],
        };
        expect(evaluateConditionalFormatting(config, triggersFor(config), row, VARIANCE_COL_ID)).toEqual({
            backgroundColor: RED,
        });
    });

    // #2 — a plain value cell sitting on a subtotal row (transposed) must never be painted.
    it("skips a value cell on a subtotal row", () => {
        const row: AgGridRowData = {
            cellDataByColId: {
                [VARIANCE_COL_ID]: buildMeasureCell(-24, {
                    rowDefinition: { type: "subtotal", rowIndex: 0, rowScope: [] },
                }),
            },
            allRowData: [-24],
        };
        const config: IConditionalFormatting = {
            enabled: true,
            rules: [
                {
                    id: "r",
                    target: { kind: "measure", measureIdentifier: VARIANCE_MEASURE_ID },
                    conditions: [
                        {
                            id: "c",
                            operator: "ALL",
                            value: { kind: "none" },
                            format: { backgroundColor: RED, scope: "cell" },
                        },
                    ],
                },
            ],
        };
        expect(
            evaluateConditionalFormatting(config, triggersFor(config), row, VARIANCE_COL_ID),
        ).toBeUndefined();
    });

    // first-match-wins: the EARLIER condition wins regardless of scope (order decides, not scope).
    it("an earlier row condition wins the whole row, shadowing a later cell condition in the same rule", () => {
        const row = buildRow({ status: "High risk", variance: -24 });
        const config: IConditionalFormatting = {
            enabled: true,
            rules: [
                {
                    id: "r",
                    target: { kind: "measure", measureIdentifier: VARIANCE_MEASURE_ID },
                    conditions: [
                        {
                            id: "row",
                            operator: "LESS_THAN",
                            value: { kind: "literal", value: 0 },
                            format: { backgroundColor: GREEN, scope: "row" },
                        },
                        {
                            id: "cell",
                            operator: "LESS_THAN",
                            value: { kind: "literal", value: 0 },
                            format: { backgroundColor: RED, scope: "cell" },
                        },
                    ],
                },
            ],
        };
        // Trigger (variance) cell AND the rest of the row get the earlier row condition's green.
        expect(evaluateConditionalFormatting(config, triggersFor(config), row, VARIANCE_COL_ID)).toEqual({
            backgroundColor: GREEN,
        });
        expect(evaluateConditionalFormatting(config, triggersFor(config), row, STATUS_COL_ID)).toEqual({
            backgroundColor: GREEN,
        });
    });

    it("an earlier cell condition paints only its cell and shadows a later row condition", () => {
        const row = buildRow({ status: "High risk", variance: -24 });
        const config: IConditionalFormatting = {
            enabled: true,
            rules: [
                {
                    id: "r",
                    target: { kind: "measure", measureIdentifier: VARIANCE_MEASURE_ID },
                    conditions: [
                        {
                            id: "cell",
                            operator: "LESS_THAN",
                            value: { kind: "literal", value: 0 },
                            format: { backgroundColor: RED, scope: "cell" },
                        },
                        {
                            id: "row",
                            operator: "LESS_THAN",
                            value: { kind: "literal", value: 0 },
                            format: { backgroundColor: GREEN, scope: "row" },
                        },
                    ],
                },
            ],
        };
        // Trigger cell: the earlier cell condition wins.
        expect(evaluateConditionalFormatting(config, triggersFor(config), row, VARIANCE_COL_ID)).toEqual({
            backgroundColor: RED,
        });
        // Non-trigger cell: the winning cell condition doesn't reach it, and the later row condition is
        // shadowed — so nothing paints here.
        expect(
            evaluateConditionalFormatting(config, triggersFor(config), row, STATUS_COL_ID),
        ).toBeUndefined();
    });
});

function buildRow(values: { status: string; variance: number | null }): AgGridRowData {
    const statusCell = buildAttributeCell(values.status);
    const varianceCell = buildMeasureCell(values.variance);
    return {
        cellDataByColId: {
            [STATUS_COL_ID]: statusCell,
            [VARIANCE_COL_ID]: varianceCell,
        },
        allRowData: [values.status, values.variance],
    };
}

function buildAttributeCell(name: string): ITableAttributeHeaderValue {
    return {
        type: "attributeHeader",
        formattedValue: name,
        value: { attributeHeaderItem: { name, uri: "/gdc/md/demo/obj/status/elements?id=1" } },
        rowIndex: 0,
        columnIndex: 0,
        rowDefinition: { type: "value", rowIndex: 0, rowScope: [] },
        columnDefinition: buildAttributeColumnDefinition(),
    };
}

function buildMeasureCell(
    value: number | null,
    opts: { formattedValue?: string; rowDefinition?: ITableMeasureValue["rowDefinition"] } = {},
): ITableMeasureValue {
    return {
        type: "value",
        formattedValue: opts.formattedValue ?? (value === null ? "" : `${value}%`),
        value,
        rowIndex: 0,
        columnIndex: 1,
        rowDefinition: opts.rowDefinition ?? { type: "value", rowIndex: 0, rowScope: [] },
        columnDefinition: buildValueColumnDefinition(),
    };
}

function buildAttributeColumnDefinition(): ITableAttributeColumnDefinition {
    return {
        type: "attribute",
        columnIndex: 0,
        rowHeaderIndex: 0,
        attributeDescriptor: buildAttributeDescriptor(),
    };
}

function buildValueColumnDefinition(): ITableValueColumnDefinition {
    return {
        type: "value",
        columnIndex: 1,
        columnHeaderIndex: 0,
        isEmpty: false,
        isTransposed: false,
        columnScope: [
            { type: "measureScope", descriptor: buildMeasureDescriptor(), header: buildMeasureHeader() },
        ],
        measureHeader: buildMeasureHeader(),
        measureDescriptor: buildMeasureDescriptor(),
    };
}

function buildMeasureGroupValueColumnDefinition(): ITableMeasureGroupValueColumnDefinition {
    return {
        type: "measureGroupValue",
        columnIndex: 1,
        measureGroupDescriptor: buildMeasureGroupDescriptor(),
    };
}

function buildMeasureGroupDescriptor(): IMeasureGroupDescriptor {
    return {
        measureGroupHeader: {
            items: [
                buildMeasureDescriptor(),
                {
                    measureHeaderItem: {
                        localIdentifier: "amount",
                        name: "Amount",
                        format: "#,##0",
                        ref: idRef("amount"),
                    },
                },
            ],
        },
    };
}

// A transposed value cell: the measure lives in the row scope (not a column), so the row's measure
// is read from rowDefinition.rowScope.
function buildTransposedMeasureCell(value: number | null, measureLocalId: string): ITableMeasureValue {
    return {
        type: "value",
        formattedValue: value === null ? "" : `${value}`,
        value,
        rowIndex: 0,
        columnIndex: 1,
        rowDefinition: {
            type: "value",
            rowIndex: 0,
            rowScope: [
                {
                    type: "measureScope",
                    descriptor: {
                        measureHeaderItem: {
                            localIdentifier: measureLocalId,
                            name: measureLocalId,
                            format: "#",
                            ref: idRef(measureLocalId),
                        },
                    },
                    header: { measureHeaderItem: { name: measureLocalId, order: 0 } },
                },
            ],
        },
        columnDefinition: buildMeasureGroupValueColumnDefinition(),
    };
}

function buildRegionAttributeDescriptor(): IAttributeDescriptor {
    return {
        attributeHeader: {
            uri: "/gdc/md/demo/obj/region",
            identifier: "region.id",
            localIdentifier: "region",
            ref: idRef("region.id"),
            name: "Region",
            formOf: {
                ref: idRef("attr.region"),
                uri: "/gdc/md/demo/obj/attr.region",
                identifier: "attr.region",
                name: "Region",
            },
            primaryLabel: idRef("region.id"),
        },
    };
}

// Column-attribute scope pinning one pivot group (its element uri makes the column's colId unique).
function regionAttributeScope(uri: string) {
    return {
        type: "attributeScope" as const,
        descriptor: buildRegionAttributeDescriptor(),
        header: { attributeHeaderItem: { name: uri, uri } },
    };
}

// Non-transposed pivoted value column: column scope names the pivot group AND the measure.
function buildPivotedValueColumnDefinition(regionUri: string): ITableValueColumnDefinition {
    return {
        type: "value",
        columnIndex: 1,
        columnHeaderIndex: 0,
        isEmpty: false,
        isTransposed: false,
        columnScope: [
            regionAttributeScope(regionUri),
            { type: "measureScope", descriptor: buildMeasureDescriptor(), header: buildMeasureHeader() },
        ],
        measureHeader: buildMeasureHeader(),
        measureDescriptor: buildMeasureDescriptor(),
    };
}

// Transposed pivoted value column: column scope names only the pivot group; the measure is in the row.
function buildTransposedPivotedValueColumnDefinition(regionUri: string): ITableValueColumnDefinition {
    return {
        type: "value",
        columnIndex: 1,
        columnHeaderIndex: 0,
        isEmpty: false,
        isTransposed: true,
        columnScope: [regionAttributeScope(regionUri)],
        attributeHeader: regionAttributeScope(regionUri).header,
        attributeDescriptor: buildRegionAttributeDescriptor(),
    };
}

// A pivoted value cell. `rowMeasureLocalId` is set only when measures are transposed into rows
// (the measure then lives in the row scope rather than the column scope).
function buildPivotedMeasureCell(
    value: number,
    columnDefinition: ITableValueColumnDefinition,
    rowMeasureLocalId?: string,
): ITableMeasureValue {
    return {
        type: "value",
        formattedValue: `${value}`,
        value,
        rowIndex: 0,
        columnIndex: 1,
        rowDefinition: {
            type: "value",
            rowIndex: 0,
            rowScope: rowMeasureLocalId
                ? [
                      {
                          type: "measureScope",
                          descriptor: {
                              measureHeaderItem: {
                                  localIdentifier: rowMeasureLocalId,
                                  name: rowMeasureLocalId,
                                  format: "#",
                                  ref: idRef(rowMeasureLocalId),
                              },
                          },
                          header: { measureHeaderItem: { name: rowMeasureLocalId, order: 0 } },
                      },
                  ]
                : [],
        },
        columnDefinition,
    };
}

function buildAttributeDescriptor(): IAttributeDescriptor {
    return {
        attributeHeader: {
            uri: `/gdc/md/demo/obj/${STATUS_ATTR_ID}`,
            identifier: `${STATUS_ATTR_ID}.id`,
            localIdentifier: STATUS_ATTR_ID,
            ref: idRef(`${STATUS_ATTR_ID}.id`),
            name: "Status",
            formOf: {
                ref: idRef("attr.status"),
                uri: "/gdc/md/demo/obj/attr.status",
                identifier: "attr.status",
                name: "Status",
            },
            primaryLabel: idRef(`${STATUS_ATTR_ID}.id`),
        },
    };
}

function buildMeasureDescriptor(): IMeasureDescriptor {
    return {
        measureHeaderItem: {
            localIdentifier: VARIANCE_MEASURE_ID,
            name: "Variance %",
            format: "#,##0.00%",
            ref: idRef(VARIANCE_MEASURE_ID),
        },
    };
}

function buildMeasureHeader(): IResultMeasureHeader {
    return {
        measureHeaderItem: {
            name: "Variance %",
            order: 0,
        },
    };
}
