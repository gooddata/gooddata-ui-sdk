// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { DeclarativeDataset } from "@gooddata/api-client-tiger";
import type { Dataset } from "@gooddata/sdk-code-schemas/v1";

import { declarativeDatasetToYaml } from "../from/declarativeDatasetToYaml.js";
import { yamlDatasetToDeclarative } from "../to/yamlDatasetToDeclarative.js";
import type { ExportEntities, Profile } from "../types.js";

const profile: Profile = {
    host: "https://example.gooddata.host",
    token: "t",
    workspace_id: "ws",
    data_source: "ds_main",
};

const noEntities: ExportEntities = [];

/**
 * Round-trip an agg-aware DeclarativeDataset shape through YAML and back, asserting
 * that every aggregate-aware field (CQ-2302) survives both conversion directions.
 *
 * Fixture covers:
 *  - one AUXILIARY dataset (no `dataSourceTableId`, no `sql`, no `aggregatedFacts`)
 *  - one pre-aggregation NORMAL dataset with HLL fact, `aggregatedFacts[]`, `precedence`
 *  - one synthesized dim NORMAL dataset with `sql` block (multi-line)
 *  - one base NORMAL dataset with plain `dataSourceTableId`
 */
describe("dataset agg-aware round-trip (CQ-2302)", () => {
    function roundTrip(declarative: DeclarativeDataset): DeclarativeDataset {
        const { json: yamlAsJson } = declarativeDatasetToYaml(declarative, profile, {});
        return yamlDatasetToDeclarative(noEntities, yamlAsJson as Dataset, profile.data_source);
    }

    describe("AUXILIARY dataset", () => {
        const aux: DeclarativeDataset = {
            id: "aux_country",
            title: "Country (AUX)",
            type: "AUXILIARY",
            grain: [{ id: "country_id", type: "attribute" }],
            references: [],
            attributes: [
                {
                    id: "country_id",
                    title: "Country ID",
                    // AUX attribute mirrors the dataType of the column on the referencing
                    // pre-aggregation dataset - it is a real invariant, not a sentinel.
                    sourceColumnDataType: "STRING",
                    sourceColumn: "country_id_should_be_dropped",
                    labels: [
                        {
                            id: "country_name",
                            title: "Country Name",
                            sourceColumn: "country_name_should_be_dropped",
                            sourceColumnDataType: "STRING",
                        },
                    ],
                },
            ],
            facts: [],
        };

        it("preserves type=AUXILIARY through round-trip", () => {
            const out = roundTrip(aux);
            expect(out.type).toBe("AUXILIARY");
        });

        it("emits no source_column for AUX attributes or their labels (FROM direction)", () => {
            const { content } = declarativeDatasetToYaml(aux, profile, {});
            expect(content).not.toMatch(/source_column:/);
        });

        it("ignores source_column on AUX attributes from YAML (TO direction)", () => {
            const yaml: Dataset = {
                type: "dataset",
                id: "aux_country",
                title: "Country (AUX)",
                dataset_type: "auxiliary",
                primary_key: "country_id",
                fields: {
                    country_id: {
                        type: "attribute",
                        // schema-allowed but conceptually wrong - must not propagate
                        source_column: "fake_column",
                        data_type: "STRING",
                        labels: {
                            country_name: {
                                title: "Country Name",
                                source_column: "fake_label_column",
                                data_type: "STRING",
                            },
                        },
                    },
                },
            } as Dataset;

            const out = yamlDatasetToDeclarative(noEntities, yaml, profile.data_source);
            expect(out.type).toBe("AUXILIARY");
            expect(out.attributes?.[0]?.sourceColumn).toBeUndefined();
            expect(out.attributes?.[0]?.sourceColumnDataType).toBe("STRING");
            expect(out.attributes?.[0]?.labels[0]?.sourceColumn).toBeUndefined();
            expect(out.attributes?.[0]?.labels[0]?.sourceColumnDataType).toBe("STRING");
        });

        it("does not synthesize dataSourceTableId or sql for AUX", () => {
            const out = roundTrip(aux);
            expect(out.dataSourceTableId).toBeUndefined();
            expect(out.sql).toBeUndefined();
        });
    });

    describe("pre-aggregation dataset with HLL + aggregatedFacts + precedence", () => {
        const preAgg: DeclarativeDataset = {
            id: "orders_by_country",
            title: "Orders by Country (pre-agg)",
            type: "NORMAL",
            precedence: 10,
            dataSourceTableId: {
                id: "orders_by_country",
                type: "dataSource",
                dataSourceId: "ds_main",
                path: ["public", "orders_by_country"],
            },
            grain: [{ id: "country_ref", type: "attribute" }],
            references: [
                {
                    identifier: { id: "aux_country", type: "dataset" },
                    multivalue: false,
                    sources: [
                        {
                            column: "country_id",
                            dataType: "STRING",
                            target: { id: "country_id", type: "attribute" },
                        },
                    ],
                },
            ],
            attributes: [
                {
                    id: "country_ref",
                    title: "Country Ref",
                    sourceColumn: "country_id",
                    sourceColumnDataType: "STRING",
                    labels: [],
                },
            ],
            facts: [
                {
                    id: "users_hll",
                    title: "Users (HLL sketch)",
                    sourceColumn: "users_hll",
                    sourceColumnDataType: "HLL",
                },
            ],
            aggregatedFacts: [
                {
                    id: "users_approx",
                    sourceColumn: "users_hll",
                    sourceColumnDataType: "HLL",
                    sourceFactReference: {
                        operation: "APPROXIMATE_COUNT",
                        reference: { id: "users_hll", type: "fact" },
                    },
                },
                {
                    id: "amount_sum",
                    sourceColumn: "amount",
                    sourceColumnDataType: "NUMERIC",
                    sourceFactReference: {
                        operation: "SUM",
                        reference: { id: "amount", type: "fact" },
                    },
                },
            ],
        };

        it("preserves precedence", () => {
            const out = roundTrip(preAgg);
            expect(out.precedence).toBe(10);
        });

        it("preserves HLL sourceColumnDataType on facts", () => {
            const out = roundTrip(preAgg);
            const hllFact = out.facts?.find((f) => f.id === "users_hll");
            expect(hllFact?.sourceColumnDataType).toBe("HLL");
        });

        it("preserves aggregatedFacts[] including APPROXIMATE_COUNT operation", () => {
            const out = roundTrip(preAgg);
            const agg = out.aggregatedFacts ?? [];
            expect(agg).toHaveLength(2);

            const approx = agg.find((f) => f.id === "users_approx");
            expect(approx?.sourceFactReference.operation).toBe("APPROXIMATE_COUNT");
            expect(approx?.sourceFactReference.reference.id).toBe("users_hll");
            expect(approx?.sourceColumnDataType).toBe("HLL");

            const sum = agg.find((f) => f.id === "amount_sum");
            expect(sum?.sourceFactReference.operation).toBe("SUM");
        });

        it("preserves the reference to the AUX dataset", () => {
            const out = roundTrip(preAgg);
            expect(out.references?.[0]?.identifier.id).toBe("aux_country");
        });
    });

    describe("synthesized dim with sql: UNION block", () => {
        const sqlDim: DeclarativeDataset = {
            id: "dim_country",
            title: "Dim Country (synthesized)",
            type: "NORMAL",
            sql: {
                statement:
                    "SELECT DISTINCT country_id FROM public.orders_by_country\nUNION\nSELECT DISTINCT country_id FROM public.users_by_country",
                dataSourceId: "ds_main",
            },
            grain: [{ id: "country_id", type: "attribute" }],
            references: [],
            attributes: [
                {
                    id: "country_id",
                    title: "Country ID",
                    sourceColumn: "country_id",
                    sourceColumnDataType: "STRING",
                    labels: [],
                },
            ],
            facts: [],
        };

        it("preserves multi-line sql.statement byte-for-byte", () => {
            const out = roundTrip(sqlDim);
            expect(out.sql?.statement).toBe(sqlDim.sql!.statement);
        });

        it("does not emit dataSourceTableId for sql-backed dataset", () => {
            const out = roundTrip(sqlDim);
            expect(out.dataSourceTableId).toBeUndefined();
        });
    });

    describe("base NORMAL dataset with dataSourceTableId", () => {
        const base: DeclarativeDataset = {
            id: "users",
            title: "Users",
            type: "NORMAL",
            dataSourceTableId: {
                id: "users",
                type: "dataSource",
                dataSourceId: "ds_main",
                path: ["public", "users"],
            },
            grain: [{ id: "user_id", type: "attribute" }],
            references: [],
            attributes: [
                {
                    id: "user_id",
                    title: "User ID",
                    sourceColumn: "user_id",
                    sourceColumnDataType: "STRING",
                    labels: [],
                },
            ],
            facts: [],
        };

        it("preserves dataSourceTableId path through round-trip", () => {
            const out = roundTrip(base);
            expect(out.dataSourceTableId?.path).toEqual(["public", "users"]);
        });

        it("does not emit sql for table-backed dataset", () => {
            const out = roundTrip(base);
            expect(out.sql).toBeUndefined();
        });
    });
});
