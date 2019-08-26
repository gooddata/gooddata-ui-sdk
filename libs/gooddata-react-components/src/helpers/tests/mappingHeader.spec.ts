// (C) 2007-2018 GoodData Corporation
import {
    getMappingHeaderIdentifier,
    getMappingHeaderLocalIdentifier,
    getMappingHeaderName,
    getMappingHeaderUri,
} from "../mappingHeader";
import {
    attributeHeader,
    attributeHeaderItem,
    measureHeaders,
} from "../../factory/tests/HeaderPredicateFactory.mock";

describe("getMappingHeaderLocalIdentifier", () => {
    it("should return localIdentifier from attributeHeader", () => {
        expect(getMappingHeaderLocalIdentifier(attributeHeader)).toBe("attributeLocalIdentifier");
    });

    it("should return localIdentifier from measureHeader", () => {
        expect(getMappingHeaderLocalIdentifier(measureHeaders.uriBasedMeasure)).toBe(
            "uriBasedMeasureLocalIdentifier",
        );
    });

    it("should throw error when object is not attributeHeader or measureHeaders.uriBasedMeasure", () => {
        expect(() => getMappingHeaderLocalIdentifier(attributeHeaderItem)).toThrowError();
    });
});

describe("getMappingHeaderName", () => {
    it("should return name from formOf of attributeHeader", () => {
        expect(getMappingHeaderName(attributeHeader)).toBe("attributeElementName");
    });

    it("should return name from attributeHeaderItem", () => {
        expect(getMappingHeaderName(attributeHeaderItem)).toBe("attributeItemName");
    });

    it("should return name from measureHeaders.uriBasedMeasure", () => {
        expect(getMappingHeaderName(measureHeaders.uriBasedMeasure)).toBe("uriBasedMeasureName");
    });
});

describe("getMappingHeaderIndentifier", () => {
    it("should return identifier from attributeHeader", () => {
        expect(getMappingHeaderIdentifier(attributeHeader)).toBe("attributeIdentifier");
    });

    it("should return identifier from measureHeader", () => {
        expect(getMappingHeaderIdentifier(measureHeaders.uriBasedMeasure)).toBe("uriBasedMeasureIdentifier");
    });

    it("should throw error when object is not attributeHeader or measureHeaders.uriBasedMeasure", () => {
        expect(() => getMappingHeaderIdentifier(attributeHeaderItem)).toThrowError();
    });
});

describe("getMappingHeaderUri", () => {
    it("should return uri from attributeHeader", () => {
        expect(getMappingHeaderUri(attributeHeader)).toBe("/attributeUri");
    });

    it("should return uri from attributeHeaderItem", () => {
        expect(getMappingHeaderUri(attributeHeaderItem)).toBe("/attributeItemUri");
    });

    it("should return uri from measureHeaders.uriBasedMeasure", () => {
        expect(getMappingHeaderUri(measureHeaders.uriBasedMeasure)).toBe("/uriBasedMeasureUri");
    });
});
