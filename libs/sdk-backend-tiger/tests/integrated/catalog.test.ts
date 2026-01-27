// (C) 2022-2026 GoodData Corporation

import { beforeAll, describe, expect, it } from "vitest";

import { measureLocalId, newArithmeticMeasure, newPopMeasure } from "@gooddata/sdk-model";

import { sanitizeWorkspace, sortToOrder, testBackend, testWorkspace } from "./backend.js";
import { WinRate } from "../../src/fixtures/full.js";

const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

describe("tiger catalog", () => {
    it("should read catalog for reference workspace", async () => {
        const result = await backend.workspace(testWorkspace()).catalog().load();
        const sanitizedResult = sanitizeWorkspace(result);
        expect(sortToOrder(sanitizedResult)).toMatchSnapshot();
    });

    it("should read catalog for reference workspace with additional date attributes", async () => {
        const result = await backend
            .workspace(testWorkspace())
            .catalog()
            .withOptions({
                types: ["dateDataset"],
                production: true,
                includeDateGranularities: [
                    "GDC.time.day_in_week",
                    "GDC.time.day_in_month",
                    "GDC.time.day_in_quarter",
                    "GDC.time.day_in_year",
                    "GDC.time.week_in_quarter",
                    "GDC.time.week_in_year",
                    "GDC.time.month_in_quarter",
                    "GDC.time.month_in_year",
                    "GDC.time.quarter_in_year",
                ],
            })
            .load();

        const sanitizedResult = sanitizeWorkspace(result);
        expect(sortToOrder(sanitizedResult)).toMatchSnapshot();
    });

    it("should correctly get catalog availability when derived and arithmetic measures are in the mix", async () => {
        /*
         * This test verifies that catalog availability executes successfully when arithmetic measures and PoP measures
         * derived from them are in the mix.
         *
         * These measures _must_ be excluded from the availability calls to backed. trying to send them downstairs results in
         * backend responding with 400 (because the API client generates invalid MAQL).
         */

        const catalog = await backend.workspace(testWorkspace()).catalog().load();

        const arithmeticMeasure = newArithmeticMeasure(
            [measureLocalId(WinRate), measureLocalId(WinRate)],
            "sum",
        );
        const availability = await catalog
            .availableItems()
            .forItems([
                newPopMeasure(WinRate, "f_account.id", (m) => m.alias("PoP measure")),
                WinRate,
                arithmeticMeasure,
                newPopMeasure(arithmeticMeasure, "f_account.id", (m) => m.alias("PoP measure")),
            ])
            .load();

        const sanitizedResult = sanitizeWorkspace(availability);
        expect(sortToOrder(sanitizedResult)).toMatchSnapshot();
    });
});
