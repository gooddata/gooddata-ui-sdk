// (C) 2023-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { attributesData, catalogAttributes, catalogDateDatasets } from "./utils.fixture.js";
import {
    appendEmptyAttribute,
    convertToCatalogAttributeData,
    convertToCatalogAttributeDataByRefs,
    findCatalogAttributeByRef,
    searchAttributes,
} from "../utils.js";

describe("utils", () => {
    describe("convertToCatalogAttributeData", () => {
        it("should return empty map when catalog is empty", () => {
            expect(convertToCatalogAttributeData([], [])).toMatchSnapshot();
        });

        it("should return correct catalog attributes map", () => {
            expect(convertToCatalogAttributeData(catalogAttributes, catalogDateDatasets)).toMatchSnapshot();
        });
    });

    describe("findCatalogAttributeByRef", () => {
        const catalogAttributesMap = convertToCatalogAttributeData(catalogAttributes, catalogDateDatasets);

        it("should return undefined when catalog attributes map is empty", () => {
            expect(
                findCatalogAttributeByRef(new Map(), {
                    identifier: "dt_activity_timestamp.day",
                    type: "attribute",
                }),
            ).toBeFalsy();
        });

        it("should return undefined when catalog attributes map does not contain attribute", () => {
            expect(
                findCatalogAttributeByRef(catalogAttributesMap, {
                    identifier: "dt_activity_timestamp.day1",
                    type: "attribute",
                }),
            ).toBeFalsy();
        });

        it("should return correct catalog attribute", () => {
            expect(
                findCatalogAttributeByRef(catalogAttributesMap, {
                    identifier: "dt_activity_timestamp.day",
                    type: "attribute",
                }),
            ).toMatchSnapshot();
        });
    });

    describe("convertToCatalogAttributeDataByRefs", () => {
        const catalogAttributesMap = convertToCatalogAttributeData(catalogAttributes, catalogDateDatasets);

        it("should return empty array when refs are empty", () => {
            expect(convertToCatalogAttributeDataByRefs(catalogAttributesMap, [])).toEqual([]);
        });

        it("should return correct catalog attributes", () => {
            expect(
                convertToCatalogAttributeDataByRefs(catalogAttributesMap, [
                    {
                        identifier: "dt_activity_timestamp.day",
                        type: "attribute",
                    },
                    {
                        identifier: "dt_activity_timestamp.month",
                        type: "attribute",
                    },
                    {
                        identifier: "attr.f_account.account",
                        type: "attribute",
                    },
                    {
                        identifier: "attr.f_account.account_not_exist",
                        type: "attribute",
                    },
                ]),
            ).toMatchSnapshot();
        });
    });

    describe("appendEmptyAttribute", () => {
        it("should append new item in the first of array", () => {
            expect(appendEmptyAttribute(attributesData, -1)).toMatchSnapshot();
        });

        it("should append new item in the first of array when attributes is empty", () => {
            expect(appendEmptyAttribute([], -1)).toMatchSnapshot();
        });

        it("should append new item after base item", () => {
            expect(appendEmptyAttribute(attributesData, 2)).toMatchSnapshot();
            expect(appendEmptyAttribute(attributesData, 3)).toMatchSnapshot();
        });

        it("should append item correctly when existing uncompleted above", () => {
            const attributes = [...attributesData];
            attributes.splice(1, 0, {});
            expect(appendEmptyAttribute(attributes, 3)).toMatchSnapshot();
        });

        it("should append item correctly when existing uncompleted below", () => {
            const attributes = [...attributesData];
            attributes.splice(2, 0, {});
            expect(appendEmptyAttribute(attributes, 1)).toMatchSnapshot();
        });
    });

    describe("searchAttributes", () => {
        it("should return empty array when attributes is empty", () => {
            expect(searchAttributes([], "attribute", "test")).toEqual([]);
        });

        it("should return correct array when search string is empty", () => {
            expect(searchAttributes(attributesData, "attribute", "")).toMatchSnapshot();
        });

        it("should return correct array when search string is not empty", () => {
            expect(searchAttributes(attributesData, "attribute", "Acc")).toMatchSnapshot();
            expect(searchAttributes(attributesData, "dateAttribute", "Acc")).toMatchSnapshot();
        });
    });
});
