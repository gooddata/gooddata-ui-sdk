// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import {
    DataViewFirstPage,
    type ScenarioRecording,
    recordedDataView,
} from "@gooddata/sdk-backend-mockingbird";
import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type IResultAttributeHeaderItem, isResultAttributeHeader } from "@gooddata/sdk-model";
import { DataViewFacade, type IDataSeries } from "@gooddata/sdk-ui";

import { calculatePredictedValue, calculateValues } from "./useAttributeValuesFromExecResults.js";

// A recorded single-attribute result whose element headers carry a formatted name next to the raw one, as
// they do after the hook formats a number-formatted attribute.
const recorded = recordedDataView(
    // Casting recorded JSON to ScenarioRecording is the repo-wide idiom for fixtures.
    ReferenceRecordings.Scenarios.PivotTable.SingleAttribute as ScenarioRecording,
    DataViewFirstPage,
);

function withAttributeHeaders(
    update: (item: IResultAttributeHeaderItem) => Partial<IResultAttributeHeaderItem>,
): DataViewFacade {
    const view: IDataView = Object.assign(Object.create(Object.getPrototypeOf(recorded)), recorded, {
        headerItems: recorded.headerItems.map((dim) =>
            dim.map((headers) =>
                headers.map((h) =>
                    isResultAttributeHeader(h)
                        ? {
                              attributeHeaderItem: {
                                  ...h.attributeHeaderItem,
                                  ...update(h.attributeHeaderItem),
                              },
                          }
                        : h,
                ),
            ),
        ),
    });
    return DataViewFacade.for(view);
}

const dataView = withAttributeHeaders(({ name }) => ({ formattedName: `formatted ${name}` }));
const ATTRIBUTE: [number, number] = [0, 0];

function series(scopeTitle: string, rawValue: string): IDataSeries {
    return [
        { total: false, rawValue, seriesDesc: { scopeTitles: () => [scopeTitle] } },
    ] as unknown as IDataSeries;
}

describe("alert value matching on formatted attribute values", () => {
    it("matches the raw filter value against raw names and returns raw names, not formatted titles", () => {
        expect(calculateValues(dataView, ATTRIBUTE, "CompuSci")).toEqual(["CompuSci"]);
        expect(calculateValues(dataView, ATTRIBUTE, "formatted CompuSci")).toEqual([]);
        expect(calculateValues(dataView, ATTRIBUTE)).toContain("CompuSci");
        expect(calculateValues(dataView, ATTRIBUTE).some((v) => v.startsWith("formatted"))).toBe(false);
    });

    it("matches a filter value holding the element uri and returns the raw name", () => {
        // the recorded uris equal the names, so give the elements uris of their own
        const withUris = withAttributeHeaders(({ name }) => ({
            uri: `uri:${name}`,
            formattedName: `formatted ${name}`,
        }));

        expect(calculateValues(withUris, ATTRIBUTE, "uri:CompuSci")).toEqual(["CompuSci"]);
    });

    it("predicts the value from the series scoped by the raw value", () => {
        // scope titles of the data access facade are raw names
        const data = [series("CompuSci", "5"), series("Educationly", "7")];

        expect(calculatePredictedValue(data, calculateValues(dataView, ATTRIBUTE, "CompuSci"))).toBe(5);
    });
});
