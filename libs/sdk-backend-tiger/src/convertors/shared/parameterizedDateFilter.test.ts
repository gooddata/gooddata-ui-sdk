// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ITigerMeasureValueFilter } from "@gooddata/api-client-tiger";
import {
    idRef,
    isMeasureValueFilter,
    measureFilters,
    newMeasure,
    newParameterizedDateFilter,
} from "@gooddata/sdk-model";

import { convertFilter as convertFilterFromAfm } from "../fromBackend/afm/FilterConverter.js";
import { convertMeasure as convertMeasureFromAfm } from "../fromBackend/afm/MeasureConverter.js";
import {
    convertFilter as convertFilterToAfm,
    newFilterWithApplyOnResult,
} from "../toBackend/afm/FilterConverter.js";
import { convertMeasure as convertMeasureToAfm } from "../toBackend/afm/MeasureConverter.js";

import { convertSdkFilterToTigerStored, convertTigerToSdkFilters } from "./storedFilterConverter.js";

const parameterized = newParameterizedDateFilter(idRef("closed", "dataSet"), idRef("period", "parameter"), {
    localIdentifier: "periodFilter",
    emptyValueHandling: "include",
});

const afmFilter = {
    parameterizedDateFilter: {
        dataset: { identifier: { id: "closed", type: "dataset" } },
        parameter: { identifier: { id: "period", type: "parameter" } },
        localIdentifier: "periodFilter",
        emptyValueHandling: "INCLUDE",
    },
};

describe("parameterized date filter in AFM", () => {
    it("is sent as parameterizedDateFilter", () => {
        expect(convertFilterToAfm(parameterized)).toEqual(afmFilter);
    });

    it("keeps applyOnResult", () => {
        expect(convertFilterToAfm(newFilterWithApplyOnResult(parameterized, true))).toEqual({
            parameterizedDateFilter: { ...afmFilter.parameterizedDateFilter, applyOnResult: true },
        });
    });

    it("is read back as the same filter", () => {
        const afm = convertFilterToAfm(parameterized);
        expect(afm).not.toBeNull();
        expect(afm && convertFilterFromAfm(afm)).toEqual(parameterized);
    });

    it("rejects a parameter referenced by URI", () => {
        const byUri = newParameterizedDateFilter(idRef("closed", "dataSet"), { uri: "/gdc/md/period" });

        expect(() => convertFilterToAfm(byUri)).toThrow();
    });

    it("rejects a parameter ref of another type", () => {
        const wrongType = newParameterizedDateFilter(idRef("closed", "dataSet"), idRef("closed", "dataSet"));

        expect(() => convertFilterToAfm(wrongType)).toThrow();
    });

    it("is kept in a measure", () => {
        const measure = newMeasure(idRef("amount", "fact"), (m) =>
            m.aggregation("sum").filters(parameterized).localId("amount"),
        );

        expect(measureFilters(convertMeasureFromAfm(convertMeasureToAfm(measure)))).toEqual([parameterized]);
    });
});

describe("parameterized date filter in stored filters", () => {
    it("is stored as it is", () => {
        expect(convertSdkFilterToTigerStored(parameterized)).toEqual({
            parameterizedDateFilter: {
                dataSet: { identifier: { id: "closed", type: "dataset" } },
                parameter: { identifier: { id: "period", type: "parameter" } },
                localIdentifier: "periodFilter",
                emptyValueHandling: "include",
            },
        });
    });

    it("lets the measure value filters next to it be converted", () => {
        const measureValueFilter: ITigerMeasureValueFilter = {
            measureValueFilter: {
                measure: idRef("m1", "measure"),
                condition: {
                    compound: {
                        treatNullValuesAs: 0,
                        conditions: [{ comparison: { operator: "GREATER_THAN", value: 10 } }],
                    },
                },
            },
        };
        const stored = convertSdkFilterToTigerStored(parameterized);

        const [sdkMeasureValueFilter, sdkParameterized] =
            convertTigerToSdkFilters([measureValueFilter, stored]) ?? [];

        expect(isMeasureValueFilter(sdkMeasureValueFilter)).toBe(true);
        expect(
            isMeasureValueFilter(sdkMeasureValueFilter) &&
                sdkMeasureValueFilter.measureValueFilter.conditions,
        ).toEqual([{ comparison: { operator: "GREATER_THAN", value: 10, treatNullValuesAs: 0 } }]);
        expect(sdkParameterized).toEqual(parameterized);
    });
});
