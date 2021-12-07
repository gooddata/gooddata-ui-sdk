// (C) 2020 GoodData Corporation

import { testBackend, testWorkspace } from "./backend";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newArithmeticMeasure, newPopMeasure } from "@gooddata/sdk-model";

const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

describe("bear catalog", () => {
    it("should read catalog for reference workspace", async () => {
        const result = await backend.workspace(testWorkspace()).catalog().load();
        expect(result).toMatchSnapshot();
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

        expect(result).toMatchSnapshot();
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

        const arithmeticMeasure = newArithmeticMeasure([ReferenceMd.Amount, ReferenceMd.Amount_1.Sum], "sum");
        const availability = await catalog
            .availableItems()
            .forItems([
                ReferenceMd.Amount_1.Sum,
                newPopMeasure(ReferenceMd.Amount_1.Sum, "closed.year", (m) => m.alias("PoP measure")),
                arithmeticMeasure,
                newPopMeasure(arithmeticMeasure, "closed.year", (m) => m.alias("PoP measure")),
            ])
            .load();

        expect(availability).toMatchSnapshot();
    });
});
