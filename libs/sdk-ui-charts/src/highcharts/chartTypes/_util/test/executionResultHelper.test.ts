// (C) 2007-2022 GoodData Corporation

import { findAttributeInDimension, findMeasureGroupInDimensions } from "../executionResultHelper.js";
import { IAttributeDescriptor, IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { describe, it, expect } from "vitest";

const TestRecording = recordedDataFacade(
    ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy,
);

describe("findMeasureGroupInDimensions", () => {
    const sampleDimensions = TestRecording.meta().dimensions();

    it("should return the measure group header", () => {
        const returnValue = findMeasureGroupInDimensions(sampleDimensions);
        const expectedValue = (sampleDimensions[1].headers[1] as IMeasureGroupDescriptor).measureGroupHeader;
        expect(returnValue).toBe(expectedValue);
    });

    it("should throw an error if measureGroup is not the last header on it's dimension", () => {
        const invalidDimensions = [
            {
                ...sampleDimensions[1],
                headers: [...sampleDimensions[1].headers, ...sampleDimensions[0].headers],
            },
        ];
        expect(findMeasureGroupInDimensions.bind(this, invalidDimensions)).toThrow();
    });
});

describe("findAttributeInDimension", () => {
    const dimensions = TestRecording.meta().dimensions();
    const headerItems = TestRecording.meta().allHeaders();
    it("should return the view by attribute header with header items", () => {
        const returnValue = findAttributeInDimension(dimensions[1], headerItems[1]);
        const expectedValue = {
            ...(dimensions[1].headers[0] as IAttributeDescriptor).attributeHeader,
            items: headerItems[1][0],
        };
        expect(returnValue).toEqual(expectedValue);
    });
    it("should return the stack by attribute header with header items", () => {
        const returnValue = findAttributeInDimension(dimensions[0], headerItems[0]);
        const expectedValue = {
            ...(dimensions[0].headers[0] as IAttributeDescriptor).attributeHeader,
            items: headerItems[0][0],
        };
        expect(returnValue).toEqual(expectedValue);
    });
});
