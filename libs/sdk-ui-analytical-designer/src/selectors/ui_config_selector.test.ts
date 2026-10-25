// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IExtendedReferencePoint } from "@gooddata/sdk-ui-ext/internal";

import { withUiConfig } from "../tests/extended_reference_point_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";

import { visualizationAllowsMultipleDateDatasets } from "./ui_config_selector.js";

describe("visualizationAllowsMultipleDateDatasets", () => {
    function getStateWithBucketsUiConfig(bucketsUiConfig: IExtendedReferencePoint["uiConfig"]["buckets"]) {
        return withData(getInitializedState(), {
            extendedReferencePoint: withUiConfig(getInitializedState().data.extendedReferencePoint, {
                buckets: bucketsUiConfig,
            }),
        });
    }

    it("should ignore filters bucket", () => {
        expect(
            visualizationAllowsMultipleDateDatasets(
                getStateWithBucketsUiConfig({
                    filters: {
                        itemsLimitByType: {
                            date: 5,
                        },
                    },
                }),
            ),
        ).toEqual(false);
    });

    it("should return true when buckets have date items limit higher 1", () => {
        expect(
            visualizationAllowsMultipleDateDatasets(
                getStateWithBucketsUiConfig({
                    view: {
                        itemsLimitByType: {
                            date: 1,
                        },
                    },
                    attributes: {
                        itemsLimitByType: {
                            date: 1,
                        },
                    },
                }),
            ),
        ).toEqual(true);
    });

    it("should return true when multiple buckets accepts date", () => {
        expect(
            visualizationAllowsMultipleDateDatasets(
                getStateWithBucketsUiConfig({
                    view: {
                        accepts: ["date", "attribute"],
                        itemsLimit: 1,
                    },
                    attributes: {
                        accepts: ["date", "attribute"],
                        itemsLimit: 1,
                    },
                }),
            ),
        ).toEqual(true);
    });
});
