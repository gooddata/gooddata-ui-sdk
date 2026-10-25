// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { parseHash } from "./hash_parser.js";

// The hash carries no workspace prefix (the host owns the workspace in the pathname), so the
// first segment is the reportId.
describe("Uri parser", () => {
    describe("parseHash", () => {
        it.each([
            ["#/reportId/edit", "reportId"],
            ["#/123423432/edit", "123423432"],
            ["#/123423432%%$%$%/edit", "123423432%%$%$%"],
            ["#/report-with-dashes/edit", "report-with-dashes"],
            ["#/report.with.dots/edit", "report.with.dots"],
            ["#/report_with_underscores/edit", "report_with_underscores"],
        ])("should read the reportId from the first segment of %s", (hash, reportId) => {
            expect(parseHash(hash)).toEqual({
                reportId,
                forceReload: false,
                query: {},
                explainRequested: false,
            });
        });

        it("should leave the reportId undefined for a bare hash", () => {
            expect(parseHash("#/")).toEqual({
                reportId: undefined,
                forceReload: false,
                query: {},
                explainRequested: false,
            });
        });

        it("should parse the query string", () => {
            const parsed = parseHash("#/?dataset=d&includeObjectsWithTags=[i]&excludeObjectsWithTags=[e]");

            expect(parsed.reportId).toBeUndefined();
            expect(parsed.query).toEqual({
                dataset: "d",
                includeObjectsWithTags: "[i]",
                excludeObjectsWithTags: "[e]",
            });
        });

        it("should detect the reload segment", () => {
            expect(parseHash("#/123423432/edit/reload")).toEqual({
                reportId: "123423432",
                forceReload: true,
                query: {},
                explainRequested: false,
            });
        });

        it("should detect the reload segment followed by a query string", () => {
            expect(parseHash("#/123423432/edit/reload?dataset=d")).toEqual({
                reportId: "123423432",
                forceReload: true,
                query: { dataset: "d" },
                explainRequested: false,
            });
        });

        it("should detect the debug segment as an explain request", () => {
            expect(parseHash("#/123423432/debug")).toEqual({
                reportId: "123423432",
                forceReload: false,
                query: {},
                explainRequested: true,
            });
        });
    });
});
