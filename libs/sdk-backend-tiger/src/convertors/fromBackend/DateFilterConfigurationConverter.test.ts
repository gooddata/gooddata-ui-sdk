// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DateFilterGranularity } from "@gooddata/sdk-model";

import {
    DefaultDateFilterConfig,
    type IWrappedDateFilterConfig,
    convertDateFilterConfig,
} from "./DateFilterConfigurationConverter.js";

const baseConfig: IWrappedDateFilterConfig = {
    selectedOption: "THIS_MONTH",
    allTime: { localIdentifier: "ALL_TIME", name: "", visible: true },
    relativePresets: [],
    absolutePresets: [],
};

describe("convertDateFilterConfig", () => {
    it("should map a visible empty values option from the backend config", () => {
        const result = convertDateFilterConfig({
            ...baseConfig,
            emptyValues: { localIdentifier: "EMPTY_VALUES", name: "", visible: true },
        });

        expect(result.emptyValues).toEqual({
            type: "emptyValues",
            localIdentifier: "EMPTY_VALUES",
            name: "",
            visible: true,
        });
    });

    it("should preserve visible:false on the empty values option", () => {
        const result = convertDateFilterConfig({
            ...baseConfig,
            emptyValues: { localIdentifier: "EMPTY_VALUES", name: "", visible: false },
        });

        expect(result.emptyValues?.visible).toBe(false);
    });

    it("should leave emptyValues undefined when the backend config omits it", () => {
        const result = convertDateFilterConfig(baseConfig);

        expect(result.emptyValues).toBeUndefined();
    });
});

describe("convertDateFilterConfig - relativeForm granularities", () => {
    it("should map granularities from the backend config to availableGranularities", () => {
        const result = convertDateFilterConfig({
            ...baseConfig,
            relativeForm: {
                localIdentifier: "RELATIVE_FORM",
                name: "",
                visible: true,
                granularities: ["GDC.time.month", "GDC.time.year"],
            },
        });

        expect(result.relativeForm?.availableGranularities).toEqual(["GDC.time.month", "GDC.time.year"]);
    });

    it("should fall back to the default relative form when the backend config omits granularities", () => {
        const configWithoutGranularities = {
            ...baseConfig,
            relativeForm: { localIdentifier: "RELATIVE_FORM", name: "", visible: true },
        } as unknown as IWrappedDateFilterConfig;

        const result = convertDateFilterConfig(configWithoutGranularities);

        expect(result.relativeForm).toEqual(DefaultDateFilterConfig.relativeForm);
    });

    it("should filter out invalid granularity values", () => {
        const result = convertDateFilterConfig({
            ...baseConfig,
            relativeForm: {
                localIdentifier: "RELATIVE_FORM",
                name: "",
                visible: true,
                granularities: ["GDC.time.month", "invalid"] as unknown as DateFilterGranularity[],
            },
        });

        expect(result.relativeForm?.availableGranularities).toEqual(["GDC.time.month"]);
    });
});
