// (C) 2007-2019 GoodData Corporation

import { findAttributeInDimension, findMeasureGroupInDimensions } from "../executionResultHelper";
import * as fixtures from "../../../../__mocks__/fixtures";
import { IAttributeDescriptor, IMeasureGroupDescriptor } from "@gooddata/sdk-backend-spi";

describe("findMeasureGroupInDimensions", () => {
    const sampleDimensions = fixtures.barChartWithStackByAndViewByAttributes.dimensions();

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
    const dimensions = fixtures.barChartWithStackByAndViewByAttributes.dimensions();
    const headerItems = fixtures.barChartWithStackByAndViewByAttributes.allHeaders();
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
