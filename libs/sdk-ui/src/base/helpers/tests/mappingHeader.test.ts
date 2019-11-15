// (C) 2007-2019 GoodData Corporation
import {
    getMappingHeaderIdentifier,
    getMappingHeaderLocalIdentifier,
    getMappingHeaderName,
    getMappingHeaderUri,
} from "../mappingHeader";
import {
    attributeDescriptor,
    attributeHeaderItem,
    measureDescriptors,
} from "../../factory/tests/HeaderPredicateFactory.fixtures";

describe("getMappingHeaderLocalIdentifier", () => {
    it("should return localIdentifier from attributeHeader", () => {
        expect(getMappingHeaderLocalIdentifier(attributeDescriptor)).toBe("attributeLocalIdentifier");
    });

    it("should return localIdentifier from measureHeader", () => {
        expect(getMappingHeaderLocalIdentifier(measureDescriptors.uriBasedMeasure)).toBe(
            "uriBasedMeasureLocalIdentifier",
        );
    });

    it("should throw error when object is not attributeHeader or measureHeaders.uriBasedMeasure", () => {
        expect(() => getMappingHeaderLocalIdentifier(attributeHeaderItem)).toThrowError();
    });
});

describe("getMappingHeaderName", () => {
    it("should return name from formOf of attributeHeader", () => {
        expect(getMappingHeaderName(attributeDescriptor)).toBe("attributeElementName");
    });

    it("should return name from attributeHeaderItem", () => {
        expect(getMappingHeaderName(attributeHeaderItem)).toBe("attributeItemName");
    });

    it("should return name from measureHeaders.uriBasedMeasure", () => {
        expect(getMappingHeaderName(measureDescriptors.uriBasedMeasure)).toBe("uriBasedMeasureName");
    });
});

describe("getMappingHeaderIndentifier", () => {
    it("should return identifier from attributeHeader", () => {
        expect(getMappingHeaderIdentifier(attributeDescriptor)).toBe("attributeIdentifier");
    });

    it("should return identifier from measureHeader", () => {
        expect(getMappingHeaderIdentifier(measureDescriptors.uriBasedMeasure)).toBe(
            "uriBasedMeasureIdentifier",
        );
    });

    it("should throw error when object is not attributeHeader or measureHeaders.uriBasedMeasure", () => {
        expect(() => getMappingHeaderIdentifier(attributeHeaderItem)).toThrowError();
    });
});

describe("getMappingHeaderUri", () => {
    it("should return uri from attributeHeader", () => {
        expect(getMappingHeaderUri(attributeDescriptor)).toBe("/attributeUri");
    });

    it("should return uri from attributeHeaderItem", () => {
        expect(getMappingHeaderUri(attributeHeaderItem)).toBe("/attributeItemUri");
    });

    it("should return uri from measureHeaders.uriBasedMeasure", () => {
        expect(getMappingHeaderUri(measureDescriptors.uriBasedMeasure)).toBe("/uriBasedMeasureUri");
    });
});
