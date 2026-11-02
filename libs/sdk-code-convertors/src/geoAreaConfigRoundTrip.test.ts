// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { DeclarativeDataset } from "@gooddata/api-client-tiger";
import type { Dataset } from "@gooddata/sdk-code-schemas/v1";

import { declarativeDatasetToYaml } from "./from/declarativeDatasetToYaml.js";
import { yamlDatasetToDeclarative } from "./to/yamlDatasetToDeclarative.js";
import type { Profile } from "./types.js";

const profile: Profile = {
    host: "https://example.gooddata.host",
    token: "t",
    workspace_id: "ws",
    data_source: "ds_main",
};

function datasetWithGeoLabel(collection: { id: string; kind?: "STATIC" | "CUSTOM" }): DeclarativeDataset {
    return {
        id: "customer",
        title: "Customer",
        grain: [],
        references: [],
        facts: [],
        attributes: [
            {
                id: "country",
                title: "Country",
                sourceColumn: "country",
                labels: [
                    {
                        id: "country.code",
                        title: "Country code",
                        sourceColumn: "country_code",
                        valueType: "GEO_AREA",
                        geoAreaConfig: { collection },
                    },
                ],
            },
        ],
    };
}

function roundTripCollection(dataset: DeclarativeDataset) {
    const { json } = declarativeDatasetToYaml(dataset, profile, {});
    const result = yamlDatasetToDeclarative([], json as Dataset, profile.data_source);
    return result.attributes?.[0].labels[0].geoAreaConfig?.collection;
}

describe("geo area config round-trip", () => {
    it("keeps the kind of the geo collection", () => {
        expect(roundTripCollection(datasetWithGeoLabel({ id: "countries", kind: "CUSTOM" }))).toEqual({
            id: "countries",
            kind: "CUSTOM",
        });
    });

    it("does not add a kind when the geo collection has none", () => {
        expect(roundTripCollection(datasetWithGeoLabel({ id: "countries" }))).toEqual({ id: "countries" });
    });
});
