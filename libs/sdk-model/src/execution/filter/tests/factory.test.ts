// (C) 2019-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { Account, Department, Won } from "../../../../__mocks__/model.js";
import { IAttribute, IdentifierRef, LocalIdRef, attributeIdentifier } from "../../../index.js";
import { idRef, localIdRef } from "../../../objRef/factory.js";
import { attributeLocalId } from "../../attribute/index.js";
import {
    newAbsoluteDateFilter,
    newMeasureValueFilter,
    newMeasureValueFilterWithOptions,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRankingFilter,
    newRelativeDateFilter,
} from "../factory.js";

describe("filter factory", () => {
    describe("newPositiveAttributeFilter", () => {
        it("should generate correct uri filter", () => {
            expect(newPositiveAttributeFilter("foo", { uris: ["bar", "baz"] })).toMatchSnapshot();
        });

        it("should generate correct value filter", () => {
            expect(newPositiveAttributeFilter("foo", { values: ["bar", "baz"] })).toMatchSnapshot();
        });

        it("should generate correct value filter when input is array of values", () => {
            expect(newPositiveAttributeFilter("foo", ["bar", "baz"])).toMatchSnapshot();
        });

        it("should generate correct filter attribute object is on input", () => {
            expect(newPositiveAttributeFilter(Account.Name, ["bar", "baz"])).toMatchSnapshot();
        });
    });

    describe("newNegativeAttributeFilter", () => {
        it("should generate correct filter", () => {
            expect(newNegativeAttributeFilter("foo", { uris: ["bar", "baz"] })).toMatchSnapshot();
        });
        it("should generate correct textual filter", () => {
            expect(newNegativeAttributeFilter("foo", { values: ["bar", "baz"] })).toMatchSnapshot();
        });
        it("should generate correct textual filter when input is array of values", () => {
            expect(newNegativeAttributeFilter("foo", ["bar", "baz"])).toMatchSnapshot();
        });
        it("should generate correct filter when input is IAttribute instance", () => {
            expect(newNegativeAttributeFilter(Account.Name, ["bar", "baz"])).toMatchSnapshot();
        });
    });

    describe("newAbsoluteDateFilter", () => {
        it("should generate correct filter", () => {
            expect(newAbsoluteDateFilter("foo", "2018-01-01", "2018-12-31", "testLocalId")).toMatchSnapshot();
        });
    });

    describe("newRelativeDateFilter", () => {
        it("should generate correct filter", () => {
            expect(newRelativeDateFilter("foo", "GDC.time.month", 1, 3, "testLocalId")).toMatchSnapshot();
        });
    });

    describe("newMeasureValueFilter", () => {
        it("should generate comparison filter for measure object", () => {
            expect(newMeasureValueFilter(Won, "EQUAL_TO", 11)).toMatchSnapshot();
        });
        it("should generate comparison filter for measure identifier", () => {
            expect(newMeasureValueFilter(idRef("identifier"), "EQUAL_TO", 11)).toMatchSnapshot();
        });
        it("should generate comparison filter for measure local identifier", () => {
            expect(newMeasureValueFilter(localIdRef("measureObjLocalId"), "EQUAL_TO", 11)).toMatchSnapshot();
        });
        it("should generate comparison filter for measure object with treatNullValuesAs", () => {
            expect(newMeasureValueFilter(Won, "EQUAL_TO", 11, 42)).toMatchSnapshot();
        });
        it("should generate range filter for measure object", () => {
            expect(newMeasureValueFilter(Won, "BETWEEN", 0, 100)).toMatchSnapshot();
        });
        it("should generate ranger filter for measure identifier", () => {
            expect(
                newMeasureValueFilter(localIdRef("measureObjLocalId"), "BETWEEN", 0, 100),
            ).toMatchSnapshot();
        });
        it("should generate ranger filter for measure local identifier", () => {
            expect(newMeasureValueFilter("measureObjLocalId", "BETWEEN", 0, 100)).toMatchSnapshot();
        });
        it("should generate range filter for measure object with treatNullValuesAs", () => {
            expect(newMeasureValueFilter(Won, "BETWEEN", 0, 100, 42)).toMatchSnapshot();
        });
    });

    describe("newMeasureValueFilterWithOptions", () => {
        it("should generate comparison filter with options object", () => {
            expect(
                newMeasureValueFilterWithOptions(Won, {
                    operator: "GREATER_THAN",
                    value: 10,
                }),
            ).toMatchSnapshot();
        });

        it("should generate comparison filter with dimensionality from attribute objects", () => {
            expect(
                newMeasureValueFilterWithOptions(Won, {
                    operator: "EQUAL_TO",
                    value: 42,
                    dimensionality: [Department, Account.Name],
                }),
            ).toMatchSnapshot();
        });

        it("should generate comparison filter with dimensionality from identifier refs", () => {
            expect(
                newMeasureValueFilterWithOptions(Won, {
                    operator: "LESS_THAN",
                    value: 100,
                    dimensionality: [idRef("attr1", "displayForm"), idRef("attr2", "displayForm")],
                }),
            ).toMatchSnapshot();
        });

        it("should generate comparison filter with dimensionality from local id refs", () => {
            expect(
                newMeasureValueFilterWithOptions(Won, {
                    operator: "NOT_EQUAL_TO",
                    value: 0,
                    dimensionality: [localIdRef("localAttr1"), localIdRef("localAttr2")],
                }),
            ).toMatchSnapshot();
        });

        it("should generate comparison filter with treatNullValuesAs and dimensionality", () => {
            expect(
                newMeasureValueFilterWithOptions(Won, {
                    operator: "GREATER_THAN_OR_EQUAL_TO",
                    value: 5,
                    treatNullValuesAs: 0,
                    dimensionality: [Department],
                }),
            ).toMatchSnapshot();
        });

        it("should generate range filter with options object", () => {
            expect(
                newMeasureValueFilterWithOptions(Won, {
                    operator: "BETWEEN",
                    from: 0,
                    to: 100,
                }),
            ).toMatchSnapshot();
        });

        it("should generate range filter with dimensionality", () => {
            expect(
                newMeasureValueFilterWithOptions(Won, {
                    operator: "NOT_BETWEEN",
                    from: 10,
                    to: 50,
                    dimensionality: [Department, Account.Name],
                }),
            ).toMatchSnapshot();
        });

        it("should generate range filter with treatNullValuesAs and dimensionality", () => {
            expect(
                newMeasureValueFilterWithOptions(Won, {
                    operator: "BETWEEN",
                    from: 0,
                    to: 100,
                    treatNullValuesAs: -1,
                    dimensionality: [Department],
                }),
            ).toMatchSnapshot();
        });

        it("should not include dimensionality when array is empty", () => {
            expect(
                newMeasureValueFilterWithOptions(Won, {
                    operator: "EQUAL_TO",
                    value: 10,
                    dimensionality: [],
                }),
            ).toMatchSnapshot();
        });
    });

    describe("newRankingFilter", () => {
        it("should generate top filter for measure object", () => {
            expect(newRankingFilter(Won, "TOP", 10)).toMatchSnapshot();
        });
        it("should generate top filter for measure identifier", () => {
            expect(newRankingFilter(idRef("identifier"), "BOTTOM", 30)).toMatchSnapshot();
        });
        it("should generate top filter for measure local identifier ref", () => {
            expect(newRankingFilter(localIdRef("measureObjLocalId"), "TOP", 5)).toMatchSnapshot();
        });
        it("should generate top filter for measure local identifier", () => {
            expect(newRankingFilter("measureObjLocalId", "TOP", 5)).toMatchSnapshot();
        });
        it("should generate bottom filter for measure object", () => {
            expect(newRankingFilter(Won, "BOTTOM", 10)).toMatchSnapshot();
        });
        it("should remove empty array of attributes as it's invalid state", () => {
            const attributes: IAttribute[] = [];
            expect(newRankingFilter(Won, attributes, "BOTTOM", 20)).toMatchSnapshot();
        });
        it("should generate bottom filter for measure object and attribute objects", () => {
            const attributes: IAttribute[] = [Department, Account.Name];
            expect(newRankingFilter(Won, attributes, "BOTTOM", 20)).toMatchSnapshot();
        });
        it("should generate bottom filter for measure object and attribute identifiers", () => {
            const attributes: IdentifierRef[] = [
                idRef(attributeIdentifier(Department) ?? ""),
                idRef(attributeIdentifier(Account.Default) ?? ""),
            ];
            expect(newRankingFilter(Won, attributes, "BOTTOM", 5)).toMatchSnapshot();
        });
        it("should generate bottom filter for measure object and attribute local identifiers refs", () => {
            const attributes: LocalIdRef[] = [
                localIdRef(attributeLocalId(Department)),
                localIdRef(attributeLocalId(Account.Default)),
            ];
            expect(newRankingFilter(Won, attributes, "BOTTOM", 3)).toMatchSnapshot();
        });
        it("should generate bottom filter for measure object and attribute local identifiers", () => {
            const attributes: string[] = [attributeLocalId(Department), attributeLocalId(Account.Default)];
            expect(newRankingFilter(Won, attributes, "BOTTOM", 3)).toMatchSnapshot();
        });
    });
});
