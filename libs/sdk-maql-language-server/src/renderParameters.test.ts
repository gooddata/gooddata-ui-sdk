// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { SyntaxErrorListener } from "@gooddata/maql-antlr4ts";
import type { ICatalogMeasure } from "@gooddata/sdk-model";

import { LdmObjects } from "./metadata/model.js";
import { MaqlMetric } from "./parseMaql.js";
import { renderParameterDefaults, resolveParameterValues } from "./renderParameters.js";
import { ldmObjects } from "./tests/metadata.test.helpers.js";

describe("renderParameterDefaults", () => {
    it("renders the CASE template from UC 2.1 using the default", () => {
        const maql = [
            "SELECT CASE",
            '  WHEN {parameter/scenario} = "actual"   THEN SUM({fact/actual_revenue})',
            '  WHEN {parameter/scenario} = "budget"   THEN SUM({fact/budget_revenue})',
            "  ELSE NULL",
            "END",
        ].join("\n");

        expect(renderParameterDefaults(maql, ldmObjects)).toEqual({
            maql: [
                "SELECT CASE",
                '  WHEN "actual" = "actual"   THEN SUM({fact/actual_revenue})',
                '  WHEN "actual" = "budget"   THEN SUM({fact/budget_revenue})',
                "  ELSE NULL",
                "END",
            ].join("\n"),
            unresolved: [],
        });
    });

    it("renders the two-way IF form", () => {
        const maql = 'SELECT IF {parameter/scenario} = "actual"\n  THEN 1\n  ELSE 2\nEND';

        expect(renderParameterDefaults(maql, ldmObjects)?.maql).toBe(
            'SELECT IF "actual" = "actual"\n  THEN 1\n  ELSE 2\nEND',
        );
    });

    it("renders a numeric parameter bare, without quotes", () => {
        const objects = withParameters([param("threshold", { type: "NUMBER", defaultValue: 42 })]);

        expect(renderParameterDefaults("SELECT {parameter/threshold}", objects)?.maql).toBe("SELECT 42");
    });

    it("leaves other object references untouched", () => {
        const maql = "SELECT SUM({fact/rev}) WHERE {label/country} = {parameter/freetext}";

        expect(renderParameterDefaults(maql, ldmObjects)?.maql).toBe(
            'SELECT SUM({fact/rev}) WHERE {label/country} = "x"',
        );
    });

    it.each(["PARAMETER", "Parameter"])("resolves a {%s/id} reference, as the lexer does", (prefix) => {
        expect(renderParameterDefaults(`SELECT 1 WHERE {${prefix}/freetext} = "y"`, ldmObjects)).toEqual({
            maql: 'SELECT 1 WHERE "x" = "y"',
            unresolved: [],
        });
    });

    it("leaves parameter-like text inside a string literal alone", () => {
        const maql = 'SELECT 1 WHERE {label/country} = "literal {parameter/freetext}"';

        expect(renderParameterDefaults(maql, ldmObjects)).toBeUndefined();
    });

    it("reports an unresolvable parameter and leaves its reference in place", () => {
        const maql = 'SELECT 1 WHERE {parameter/nope} = "a"';

        expect(renderParameterDefaults(maql, ldmObjects)).toEqual({ maql, unresolved: ["nope"] });
    });

    it.each([
        ["a definition that has not been written yet", undefined],
        ["a definition with no default yet", { type: "STRING" }],
        ["a default with no type yet", { defaultValue: "Actual" }],
        ["an empty default", { type: "STRING", defaultValue: null }],
        ["a default of the wrong kind for its type", { type: "NUMBER", defaultValue: "abc" }],
    ])("reports a parameter with %s as unresolved rather than rendering it", (_case, definition) => {
        const objects = withParameters([
            { ...param("scenario", { type: "STRING", defaultValue: "x" }), definition },
        ]);
        const maql = 'SELECT 1 WHERE {parameter/scenario} = "x"';

        expect(renderParameterDefaults(maql, objects)).toEqual({ maql, unresolved: ["scenario"] });
    });

    it("renders a numeric default of zero", () => {
        const objects = withParameters([param("zero", { type: "NUMBER", defaultValue: 0 })]);

        expect(renderParameterDefaults("SELECT {parameter/zero}", objects)?.maql).toBe("SELECT 0");
    });

    it("is undefined for MAQL without parameters", () => {
        expect(renderParameterDefaults("SELECT SUM({fact/rev})", ldmObjects)).toBeUndefined();
    });

    it("escapes quotes and backslashes so the rendered MAQL stays parseable", () => {
        const objects = withParameters([
            param("awkward", { type: "STRING", defaultValue: 'say "hi" \\ bye' }),
        ]);

        expect(renderParameterDefaults('SELECT 1 WHERE {parameter/awkward} = "x"', objects)?.maql).toBe(
            'SELECT 1 WHERE "say \\"hi\\" \\\\ bye" = "x"',
        );
    });

    it("produces MAQL that still parses, for defaults full of awkward characters", () => {
        for (const defaultValue of [
            'say "hi"',
            "back\\slash",
            'quote"and\\slash',
            "new\nline",
            "{parameter/x}",
        ]) {
            const objects = withParameters([param("awkward", { type: "STRING", defaultValue })]);
            const rendered = renderParameterDefaults(
                "SELECT 1 WHERE {parameter/awkward} = {parameter/awkward}",
                objects,
            );

            const listener = new SyntaxErrorListener();
            const parsed = new MaqlMetric(rendered!.maql);
            parsed.addErrorListener(listener);
            void parsed.tree;

            expect(listener.antlrErrors, `rendered: ${rendered!.maql}`).toEqual([]);
        }
    });

    it("substitutes several distinct parameters on one line, left to right", () => {
        const objects = withParameters([
            param("a", { type: "STRING", defaultValue: "AA" }),
            param("b", { type: "NUMBER", defaultValue: 7 }),
        ]);

        expect(
            renderParameterDefaults("SELECT {parameter/b} WHERE {parameter/a} = {parameter/a}", objects)
                ?.maql,
        ).toBe('SELECT 7 WHERE "AA" = "AA"');
    });

    it("reports unresolved ids in document order", () => {
        const maql = "SELECT {parameter/second}\nWHERE {parameter/third} = {parameter/first}";

        expect(renderParameterDefaults(maql, withParameters([]))?.unresolved).toEqual([
            "second",
            "third",
            "first",
        ]);
    });
});

describe("resolveParameterValues", () => {
    const caseMaql = [
        "SELECT CASE",
        '  WHEN {parameter/scenario} = "Actual" THEN SUM({fact/actual_revenue})',
        '  WHEN {parameter/scenario} = "Budget" THEN SUM({fact/budget_revenue})',
        "  ELSE NULL",
        "END",
    ].join("\n");

    it("resolves a parameter through a referenced metric, as UC 3.1 renders it", () => {
        const objects = withObjects(
            [metric("revenue_by_scenario", caseMaql)],
            [param("scenario", { type: "STRING", defaultValue: "Actual" })],
        );

        expect(resolveParameterValues([], ["revenue_by_scenario"], objects)).toEqual([
            { id: "scenario", title: "scenario", value: "Actual" },
        ]);
    });

    it("resolves a parameter referenced by an inline template", () => {
        const objects = withObjects([], [param("topn", { type: "NUMBER", defaultValue: 10 })]);

        expect(resolveParameterValues(["SELECT TOP({parameter/topn})", ""], [], objects)).toEqual([
            { id: "topn", title: "topn", value: 10 },
        ]);
    });

    it("follows metric references nested in metric expressions", () => {
        const objects = withObjects(
            [
                metric("outer", "SELECT {metric/inner} * 2"),
                metric("inner", 'SELECT 1 WHERE {parameter/scenario} = "Actual"'),
            ],
            [param("scenario", { type: "STRING", defaultValue: "Actual" })],
        );

        expect(resolveParameterValues([], ["outer"], objects)).toEqual([
            { id: "scenario", title: "scenario", value: "Actual" },
        ]);
    });

    it("survives a cycle between metric expressions", () => {
        const objects = withObjects(
            [metric("a", "SELECT {metric/b} + {parameter/scenario}"), metric("b", "SELECT {metric/a}")],
            [param("scenario", { type: "STRING", defaultValue: "Actual" })],
        );

        expect(resolveParameterValues([], ["a"], objects)).toEqual([
            { id: "scenario", title: "scenario", value: "Actual" },
        ]);
    });

    it("reports each parameter once, in order of first appearance", () => {
        const objects = withObjects(
            [metric("m", "SELECT {parameter/b} + {parameter/a}")],
            [
                param("a", { type: "STRING", defaultValue: "A" }),
                param("b", { type: "NUMBER", defaultValue: 7 }),
            ],
        );

        expect(resolveParameterValues(["SELECT {parameter/b}"], ["m"], objects)).toEqual([
            { id: "b", title: "b", value: 7 },
            { id: "a", title: "a", value: "A" },
        ]);
    });

    it("reports an unknown parameter with neither title nor value", () => {
        expect(resolveParameterValues(["SELECT {parameter/missing}"], [], withObjects([], []))).toEqual([
            { id: "missing" },
        ]);
    });

    it("reports a parameter whose default cannot be rendered with its title but no value", () => {
        const objects = withObjects(
            [],
            [{ ...param("scenario", { type: "STRING", defaultValue: "x" }), definition: { type: "STRING" } }],
        );

        expect(resolveParameterValues(["SELECT {parameter/scenario}"], [], objects)).toEqual([
            { id: "scenario", title: "scenario" },
        ]);
    });

    it("ignores a reference to an unknown metric", () => {
        expect(resolveParameterValues([], ["missing"], withObjects([], []))).toEqual([]);
    });

    it("is empty when nothing references a parameter", () => {
        const objects = withObjects(
            [metric("m", "SELECT SUM({fact/rev})")],
            [param("scenario", { type: "STRING", defaultValue: "Actual" })],
        );

        expect(resolveParameterValues(["SELECT 1"], ["m"], objects)).toEqual([]);
    });
});

function metric(id: string, maql: string): ICatalogMeasure {
    return {
        type: "measure",
        measure: {
            type: "measure",
            id,
            uri: "",
            ref: { type: "measure", identifier: id },
            title: id,
            description: "",
            expression: maql,
            format: "#,##0.00",
            production: true,
            deprecated: false,
            unlisted: false,
            isLocked: false,
        },
        groups: [],
    };
}

function withObjects(metrics: ICatalogMeasure[], parameters: { id: string; definition?: unknown }[]) {
    return new LdmObjects([], [], metrics, parameters as never, [], []);
}

function param(id: string, definition: { type: "STRING" | "NUMBER"; defaultValue: string | number }) {
    return {
        type: "parameter" as const,
        id,
        title: id,
        description: "",
        definition,
        production: true,
        deprecated: false,
        unlisted: false,
        uri: "",
        ref: { type: "parameter" as const, identifier: id },
    };
}

function withParameters(parameters: { id: string; definition?: unknown }[]) {
    return withObjects([], parameters);
}
