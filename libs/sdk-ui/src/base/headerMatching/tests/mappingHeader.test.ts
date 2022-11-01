// (C) 2007-2022 GoodData Corporation
import { isAttributeDescriptor, isMeasureDescriptor, isResultAttributeHeader } from "@gooddata/sdk-model";
import { isHeaderPredicate } from "../HeaderPredicate";
import * as headerPredicateFactory from "../HeaderPredicateFactory";
import {
    getAttributeHeaderItemName,
    getMappingHeaderFormattedName,
    getMappingHeaderIdentifier,
    getMappingHeaderLocalIdentifier,
    getMappingHeaderName,
    getMappingHeaderUri,
    hasMappingHeaderFormattedName,
} from "../MappingHeader";
import {
    attributeDescriptor,
    attributeHeaderItem,
    attributeHeaderItemWithFormattedName,
    measureDescriptors,
} from "./HeaderPredicateFactory.fixtures";

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

describe("isMappingHeaderMeasureItem", () => {
    it("should return true when object contains measureHeaderItem", () => {
        expect(isMeasureDescriptor(measureDescriptors.uriBasedMeasure)).toEqual(true);
    });

    it("should return false measureHeaderItem when object does not contain measureHeaderItem", () => {
        expect(isMeasureDescriptor(attributeHeaderItem)).toEqual(false);
    });
});

describe("isMappingHeaderAttribute", () => {
    it("should return true when object contains attributeHeader", () => {
        expect(isAttributeDescriptor(attributeDescriptor)).toEqual(true);
    });

    it("should return false when measureHeaderItem when object does not contain measureHeaderItem", () => {
        expect(isAttributeDescriptor(attributeHeaderItem)).toEqual(false);
    });
});

describe("isMappingHeaderAttributeItem", () => {
    it("should return true when object contains attributeHeaderItem", () => {
        expect(isResultAttributeHeader(attributeHeaderItem)).toEqual(true);
    });

    it("should return false when object does not contain attributeHeaderItem", () => {
        expect(isResultAttributeHeader(measureDescriptors.uriBasedMeasure)).toEqual(false);
    });
});

describe("isHeaderPredicate", () => {
    it("should return true when is header predicate", () => {
        expect(isHeaderPredicate(headerPredicateFactory.uriMatch("/some-uri"))).toEqual(true);
    });

    it("should return false when is legacy drillable item", () => {
        expect(isHeaderPredicate({ uri: "/some-uri" })).toEqual(false);
    });
});

describe("hasMappingHeaderFormattedName", () => {
    it("should return true when attribute header has formatted name", () => {
        expect(hasMappingHeaderFormattedName(attributeHeaderItemWithFormattedName)).toEqual(true);
    });

    it("should return false when attribute header does not have formatted name", () => {
        expect(hasMappingHeaderFormattedName(attributeHeaderItem)).toEqual(false);
    });

    it("should return false when header is not attributeHeader", () => {
        expect(hasMappingHeaderFormattedName(measureDescriptors.uriBasedMeasure)).toEqual(false);
    });
});

describe("getMappingHeaderFormattedName", () => {
    it("should return formatted name when header is resultAttributeHeader", () => {
        expect(getMappingHeaderFormattedName(attributeHeaderItemWithFormattedName)).toEqual(
            "formattedAttributeItemName",
        );
    });

    it("should return name when header is not resultAttributeHeader", () => {
        expect(getMappingHeaderFormattedName(measureDescriptors.uriBasedMeasure)).toEqual(
            "uriBasedMeasureName",
        );
    });
});

describe("getAttributeHeaderItemName", () => {
    it("should return formatted name when it exists", () => {
        expect(getAttributeHeaderItemName(attributeHeaderItemWithFormattedName.attributeHeaderItem)).toEqual(
            "formattedAttributeItemName",
        );
    });

    it("should return name when formatted name does not exist", () => {
        expect(getAttributeHeaderItemName(attributeHeaderItem.attributeHeaderItem)).toEqual(
            "attributeItemName",
        );
    });

    it("should return undefined when provided undefined", () => {
        expect(getAttributeHeaderItemName(undefined)).toEqual(undefined);
    });
});
