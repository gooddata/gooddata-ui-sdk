// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { buildAfmExecution } from "@gooddata/sdk-code-convertors";
import {
    type EmptyValues,
    type IFilter,
    idRef,
    newAbsoluteDateFilter,
    newAllTimeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
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
    const YEAR_LABEL = "label/expected_ship_date.year";

    const Scenarios: Array<[string, unknown, IFilter | IFilter[]]> = [
        ["All time, no mode", { type: "date_filter", using: DATASET }, newAllTimeFilter(DATASET)],
        ...MODES.map((mode): [string, unknown, IFilter | IFilter[]] => [
            `All time, ${mode}`,
            { type: "date_filter", using: DATASET, empty_values: mode },
            newAllTimeFilter(DATASET, undefined, mode),
        ]),
        ...MODES.map((mode): [string, unknown, IFilter | IFilter[]] => [
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
        ...MODES.map((mode): [string, unknown, IFilter | IFilter[]] => [
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
        [
            'relative with include: [""] with: filter',
            {
                type: "date_filter",
                using: DATASET,
                granularity: "YEAR",
                from: -10,
                to: 0,
                with: { y: { type: "attribute_filter", using: YEAR_LABEL, state: { include: [""] } } },
            },
            newRelativeDateFilter(DATASET, "GDC.time.year", -10, 0, undefined, undefined, "only"),
        ],
        // `with:` attribute filters are deployed as separate filters right after the date filter
        [
            "relative with positive with: filter",
            {
                type: "date_filter",
                using: DATASET,
                granularity: "YEAR",
                from: -10,
                to: 0,
                with: { y: { type: "attribute_filter", using: YEAR_LABEL, state: { include: ["2025"] } } },
            },
            [
                newRelativeDateFilter(DATASET, "GDC.time.year", -10, 0),
                newPositiveAttributeFilter(idRef("expected_ship_date.year", "displayForm"), ["2025"]),
            ],
        ],
        [
            "absolute with negative with: filter",
            {
                type: "date_filter",
                using: DATASET,
                from: "2020-01-01",
                to: "2020-12-31",
                with: { y: { type: "attribute_filter", using: YEAR_LABEL, state: { exclude: ["2025"] } } },
            },
            [
                newAbsoluteDateFilter(DATASET, "2020-01-01", "2020-12-31"),
                newNegativeAttributeFilter(idRef("expected_ship_date.year", "displayForm"), ["2025"]),
            ],
        ],
    ];

    it.each(Scenarios)("%s", (_name, yamlFilter, modelFilter) => {
        const query = { fields: {}, filter_by: { f: yamlFilter } } as unknown as Parameters<
            typeof buildAfmExecution
        >[1];

        const { filters } = buildAfmExecution([], query).execution.execution;

        // convertFilter returns null for a filter it does not send
        const modelFilters = Array.isArray(modelFilter) ? modelFilter : [modelFilter];
        expect(filters).toEqual(modelFilters.map((f) => convertFilter(f)).filter(Boolean));
    });
});
