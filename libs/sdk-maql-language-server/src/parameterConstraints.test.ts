// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";
import { DiagnosticSeverity, Position, Range } from "vscode-languageserver";

import { ErrorCodes } from "./constants.js";
import { validate } from "./diagnostics.js";
import { ldmObjects } from "./tests/metadata.test.helpers.js";

function rangeOf(query: string, snippet: string, occurrence = 0): Range {
    let start = -1;
    for (let i = 0; i <= occurrence; i++) {
        start = query.indexOf(snippet, start + 1);
    }
    return Range.create(Position.create(0, start), Position.create(0, start + snippet.length));
}

describe("parameter constraints diagnostics", () => {
    it("warns about a branch literal that is not an allowed value", async () => {
        const query = 'SELECT CASE WHEN {parameter/scenario} = "budgt" THEN 1 ELSE NULL END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    message:
                        "\"budgt\" is not an allowed value of parameter 'scenario' " +
                        '(allowed: "actual", "budget", "forecast") — this comparison can never match',
                    severity: DiagnosticSeverity.Warning,
                    code: ErrorCodes.ParameterValueNotAllowed,
                    range: rangeOf(query, '"budgt"'),
                }),
            ]),
        );
    });

    it("warns about a not allowed literal written on the left side of the equality", async () => {
        const query = 'SELECT CASE WHEN "budgt" = {parameter/scenario} THEN 1 ELSE NULL END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    message:
                        "\"budgt\" is not an allowed value of parameter 'scenario' " +
                        '(allowed: "actual", "budget", "forecast") — this comparison can never match',
                    severity: DiagnosticSeverity.Warning,
                    code: ErrorCodes.ParameterValueNotAllowed,
                    range: rangeOf(query, '"budgt"'),
                }),
            ]),
        );
    });

    it("reports nothing when every allowed value has its own branch", async () => {
        const query =
            'SELECT CASE WHEN {parameter/scenario} = "actual" THEN 1 ' +
            'WHEN {parameter/scenario} = "budget" THEN 2 ' +
            'WHEN {parameter/scenario} = "forecast" THEN 3 ELSE NULL END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([]);
    });

    it("informs about allowed values without a branch, anchored on the CASE keyword", async () => {
        const query = 'SELECT CASE WHEN {parameter/scenario} = "actual" THEN 1 ELSE NULL END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([
            expect.objectContaining({
                message:
                    'parameter \'scenario\': allowed values "budget", "forecast" have no matching branch ' +
                    "— they fall through to ELSE/NULL",
                severity: DiagnosticSeverity.Information,
                code: ErrorCodes.ParameterValueUncovered,
                range: rangeOf(query, "CASE"),
            }),
        ]);
    });

    it("anchors the uncovered values info on the IF keyword", async () => {
        const query = 'SELECT IF {parameter/scenario} = "actual" THEN 1 ELSE 2 END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([
            expect.objectContaining({
                message:
                    'parameter \'scenario\': allowed values "budget", "forecast" have no matching branch ' +
                    "— they fall through to ELSE/NULL",
                severity: DiagnosticSeverity.Information,
                code: ErrorCodes.ParameterValueUncovered,
                range: rangeOf(query, "IF"),
            }),
        ]);
    });

    it("counts OR-combined equalities in a single branch as coverage", async () => {
        const query =
            'SELECT CASE WHEN {parameter/scenario} = "actual" OR {parameter/scenario} = "budget" ' +
            'OR {parameter/scenario} = "forecast" THEN 1 ELSE NULL END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([]);
    });

    it("suppresses only the uncovered values info when the parameter is used outside an equality", async () => {
        const query =
            'SELECT CASE WHEN {parameter/scenario} LIKE "act%" THEN 1 ' +
            'WHEN {parameter/scenario} = "budgt" THEN 2 ELSE NULL END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([
            expect.objectContaining({
                severity: DiagnosticSeverity.Warning,
                code: ErrorCodes.ParameterValueNotAllowed,
                range: rangeOf(query, '"budgt"'),
            }),
        ]);
    });

    it("evaluates two CASE expressions on the same parameter independently", async () => {
        const query =
            '(CASE WHEN {parameter/scenario} = "actual" THEN 1 ELSE NULL END) + ' +
            '(CASE WHEN {parameter/scenario} = "budgt" THEN 2 ELSE NULL END)';
        const diagnostics = await validate(`SELECT ${query}`, ldmObjects);
        expect(diagnostics).toHaveLength(3);
        expect(diagnostics).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    message:
                        'parameter \'scenario\': allowed values "budget", "forecast" have no matching branch ' +
                        "— they fall through to ELSE/NULL",
                    code: ErrorCodes.ParameterValueUncovered,
                    range: rangeOf(`SELECT ${query}`, "CASE", 0),
                }),
                expect.objectContaining({
                    code: ErrorCodes.ParameterValueNotAllowed,
                    range: rangeOf(`SELECT ${query}`, '"budgt"'),
                }),
                expect.objectContaining({
                    message:
                        'parameter \'scenario\': allowed values "actual", "budget", "forecast" ' +
                        "have no matching branch — they fall through to ELSE/NULL",
                    code: ErrorCodes.ParameterValueUncovered,
                    range: rangeOf(`SELECT ${query}`, "CASE", 1),
                }),
            ]),
        );
    });

    it("reports nothing for a free text parameter", async () => {
        const query = 'SELECT CASE WHEN {parameter/freetext} = "anything" THEN 1 ELSE NULL END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([]);
    });

    it("reports nothing for a number parameter", async () => {
        const query = 'SELECT CASE WHEN {parameter/topN} = "10" THEN 1 ELSE NULL END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([]);
    });

    it("reports nothing for an equality under NOT", async () => {
        const query = 'SELECT CASE WHEN NOT ({parameter/scenario} = "budgt") THEN 1 ELSE NULL END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([]);
    });

    it("still warns about a positive out-of-set branch alongside a NOT branch", async () => {
        const query =
            'SELECT CASE WHEN NOT ({parameter/scenario} = "actual") THEN 1 ' +
            'WHEN {parameter/scenario} = "budgt" THEN 2 ELSE NULL END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([
            expect.objectContaining({
                severity: DiagnosticSeverity.Warning,
                code: ErrorCodes.ParameterValueNotAllowed,
                range: rangeOf(query, '"budgt"'),
            }),
        ]);
    });

    it("suppresses the uncovered values info for equalities under AND", async () => {
        const query =
            'SELECT CASE WHEN {parameter/scenario} = "actual" AND {parameter/scenario} = "budget" ' +
            "THEN 1 ELSE NULL END";
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([]);
    });

    it("still warns about a not allowed literal under AND", async () => {
        const query =
            'SELECT CASE WHEN {parameter/scenario} = "budgt" AND {parameter/scenario} = "actual" ' +
            "THEN 1 ELSE NULL END";
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([
            expect.objectContaining({
                severity: DiagnosticSeverity.Warning,
                code: ErrorCodes.ParameterValueNotAllowed,
                range: rangeOf(query, '"budgt"'),
            }),
        ]);
    });

    it("suppresses the uncovered values info for a mixed OR condition", async () => {
        const query = 'SELECT CASE WHEN {parameter/scenario} = "actual" OR {fact/1} = 1 THEN 1 ELSE NULL END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([]);
    });

    it("still warns about a not allowed literal in a mixed OR condition", async () => {
        const query = 'SELECT CASE WHEN {parameter/scenario} = "budgt" OR {fact/1} = 1 THEN 1 ELSE NULL END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([
            expect.objectContaining({
                severity: DiagnosticSeverity.Warning,
                code: ErrorCodes.ParameterValueNotAllowed,
                range: rangeOf(query, '"budgt"'),
            }),
        ]);
    });

    it("suppresses the uncovered values info when OR mixes two parameters", async () => {
        const query =
            'SELECT CASE WHEN {parameter/scenario} = "actual" OR {parameter/freetext} = "x" ' +
            "THEN 1 ELSE NULL END";
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([]);
    });

    it("counts a parenthesized OR of equalities as coverage", async () => {
        const query =
            'SELECT CASE WHEN ({parameter/scenario} = "actual" OR {parameter/scenario} = "budget") ' +
            "THEN 1 ELSE NULL END";
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toEqual([
            expect.objectContaining({
                message:
                    "parameter 'scenario': allowed values \"forecast\" have no matching branch " +
                    "— they fall through to ELSE/NULL",
                severity: DiagnosticSeverity.Information,
                code: ErrorCodes.ParameterValueUncovered,
                range: rangeOf(query, "CASE"),
            }),
        ]);
    });

    it("never blocks saving the metric", async () => {
        const query = 'SELECT CASE WHEN {parameter/scenario} = "budgt" THEN 1 ELSE NULL END';
        const diagnostics = await validate(query, ldmObjects);
        expect(diagnostics).toHaveLength(2);
        for (const diagnostic of diagnostics) {
            expect(diagnostic.severity).not.toBe(DiagnosticSeverity.Error);
        }
    });
});
