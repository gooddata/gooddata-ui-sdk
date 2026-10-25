// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import { type IParameterFilter } from "../store/filter_bar/parameter_filter_types.js";

import { parametersToMetadata } from "./metadata.js";

const sampleParameter: IParameterFilter = {
    type: "parameter",
    localIdentifier: "p1",
    parameterRef: idRef("threshold", "parameter"),
    name: "Threshold",
    value: 25,
    definition: { type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } },
};

const sampleAtDefault: IParameterFilter = {
    type: "parameter",
    localIdentifier: "p2",
    parameterRef: idRef("markup", "parameter"),
    name: "Markup",
    value: 0.15,
    definition: { type: "NUMBER", defaultValue: 0.15 },
};

describe("parametersToMetadata", () => {
    it("should convert parameter filters to IInsightParameterValue[]", () => {
        expect(parametersToMetadata([sampleParameter])).toEqual([
            { ref: idRef("threshold", "parameter"), value: 25 },
        ]);
    });

    it("should skip parameters whose value equals the default (smart persistence)", () => {
        expect(parametersToMetadata([sampleAtDefault])).toEqual([]);
    });

    it("should return empty array for no inputs", () => {
        expect(parametersToMetadata([])).toEqual([]);
    });

    it("should throw when a parameter filter references parameter by URI", () => {
        const filterWithUriRef: IParameterFilter = {
            ...sampleParameter,
            parameterRef: uriRef("/gdc/md/workspace/obj/42"),
        };
        expect(() => parametersToMetadata([filterWithUriRef])).toThrow();
    });
});
