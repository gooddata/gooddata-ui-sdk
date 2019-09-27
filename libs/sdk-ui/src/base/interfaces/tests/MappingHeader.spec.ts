// (C) 2007-2018 GoodData Corporation
import { isHeaderPredicate } from "../HeaderPredicate";
import * as headerPredicateFactory from "../../factory/HeaderPredicateFactory";
import {
    attributeHeaderItem,
    measureHeaders,
    attributeHeader,
} from "../../factory/tests/HeaderPredicateFactory.mock";
import {
    isAttributeHeader,
    isMeasureHeaderItem,
    isResultAttributeHeaderItem,
} from "@gooddata/sdk-backend-spi";

describe("isMappingHeaderMeasureItem", () => {
    it("should return true when object contains measureHeaderItem", () => {
        expect(isMeasureHeaderItem(measureHeaders.uriBasedMeasure)).toEqual(true);
    });

    it("should return false measureHeaderItem when object does not contain measureHeaderItem", () => {
        expect(isMeasureHeaderItem(attributeHeaderItem)).toEqual(false);
    });
});

describe("isMappingHeaderAttribute", () => {
    it("should return true when object contains attributeHeader", () => {
        expect(isAttributeHeader(attributeHeader)).toEqual(true);
    });

    it("should return false when measureHeaderItem when object does not contain measureHeaderItem", () => {
        expect(isAttributeHeader(attributeHeaderItem)).toEqual(false);
    });
});

describe("isMappingHeaderAttributeItem", () => {
    it("should return true when object contains attributeHeaderItem", () => {
        expect(isResultAttributeHeaderItem(attributeHeaderItem)).toEqual(true);
    });

    it("should return false when object does not contain attributeHeaderItem", () => {
        expect(isResultAttributeHeaderItem(measureHeaders.uriBasedMeasure)).toEqual(false);
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
