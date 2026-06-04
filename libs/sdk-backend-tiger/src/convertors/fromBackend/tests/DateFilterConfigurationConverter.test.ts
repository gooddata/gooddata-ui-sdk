// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IWrappedDateFilterConfig,
    convertDateFilterConfig,
} from "../DateFilterConfigurationConverter.js";

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
