// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { buildAfmExecution } from "@gooddata/sdk-code-convertors";
import {
    type EmptyValues,
    type IFilter,
    newAbsoluteDateFilter,
    newAllTimeFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import { convertFilter } from "./FilterConverter.js";

/**
 * `buildAfmExecution` (sdk-code-convertors, AaC query preview) is a second implementation of the model
 * filter to AFM conversion done by `convertFilter`. The two must agree on the filters AaC can express, or
 * the preview shows different data than the stored insight. Keep this table in sync when a filter
 * property is added to either side.
 *
 * Deliberately not compared: `absoluteGranularityDateFilter` (not expressible in AaC yet).
 */
describe("AaC query preview AFM matches the model filter conversion", () => {
    const DATASET = "expected_ship_date";
    const MODES: EmptyValues[] = ["include", "exclude", "only"];

    const Scenarios: Array<[string, unknown, IFilter]> = [
        ["All time, no mode", { type: "date_filter", using: DATASET }, newAllTimeFilter(DATASET)],
        ...MODES.map((mode): [string, unknown, IFilter] => [
            `All time, ${mode}`,
            { type: "date_filter", using: DATASET, empty_values: mode },
            newAllTimeFilter(DATASET, undefined, mode),
        ]),
        ...MODES.map((mode): [string, unknown, IFilter] => [
            `relative, ${mode}`,
            {
                type: "date_filter",
                using: DATASET,
                granularity: "YEAR",
                from: -10,
                to: 0,
                empty_values: mode,
            },
            newRelativeDateFilter(DATASET, "GDC.time.year", -10, 0, undefined, undefined, mode),
        ]),
        ...MODES.map((mode): [string, unknown, IFilter] => [
            `absolute, ${mode}`,
            { type: "date_filter", using: DATASET, from: "2020-01-01", to: "2020-12-31", empty_values: mode },
            newAbsoluteDateFilter(DATASET, "2020-01-01", "2020-12-31", undefined, mode),
        ]),
        [
            "relative, no mode",
            { type: "date_filter", using: DATASET, granularity: "YEAR", from: -10, to: 0 },
            newRelativeDateFilter(DATASET, "GDC.time.year", -10, 0),
        ],
        [
            "absolute, no mode",
            { type: "date_filter", using: DATASET, from: "2020-01-01", to: "2020-12-31" },
            newAbsoluteDateFilter(DATASET, "2020-01-01", "2020-12-31"),
        ],
    ];

    it.each(Scenarios)("%s", (_name, yamlFilter, modelFilter) => {
        const query = { fields: {}, filter_by: { f: yamlFilter } } as unknown as Parameters<
            typeof buildAfmExecution
        >[1];

        const { filters } = buildAfmExecution([], query).execution.execution;

        // convertFilter returns null for a filter it does not send
        expect(filters).toEqual([convertFilter(modelFilter)].filter(Boolean));
    });
});
