// (C) 2019 GoodData Corporation

import { attributeIdentifier, attributeLocalId, attributesFind, attributeUri, IAttribute } from "../index";
import { Account, Activity, ActivityType } from "../../../__mocks__/model";

const UriDefinedAttribute: IAttribute = {
    attribute: {
        localIdentifier: "a_uri.defined",
        displayForm: {
            uri: "/gdc/uri/should/not/be/used",
        },
    },
};

describe("attributeLocalId", () => {
    it("should return local identifier", () => {
        expect(attributeLocalId(Account.Default)).toEqual("a_label.account.id");
    });

    it("should fail if attribute is null", () => {
        // @ts-ignore
        expect(() => attributeLocalId(null)).toThrow();
    });

    it("should fail if attribute is undefined", () => {
        // @ts-ignore
        expect(() => attributeLocalId(undefined)).toThrow();
    });
});

describe("attributeUri", () => {
    const Scenarios: Array<[string, any, any]> = [
        ["return URI if attribute defined as such", UriDefinedAttribute, "/gdc/uri/should/not/be/used"],
        ["return undefined if attribute defined with identifier", Account.Default, undefined],
        ["return undefined if attribute undefined", undefined, undefined],
        ["return undefined if attribute null", null, undefined],
    ];

    it.each(Scenarios)("should %s", (_desc, input, expectedResult) => {
        expect(attributeUri(input)).toBe(expectedResult);
    });
});

describe("attributeIdentifier", () => {
    const Scenarios: Array<[string, any, any]> = [
        ["return undefined if attribute defined with URI", UriDefinedAttribute, undefined],
        ["return identifier if attribute defined as such", Account.Default, "label.account.id"],
        ["return undefined if attribute undefined", undefined, undefined],
        ["return undefined if attribute null", null, undefined],
    ];

    it.each(Scenarios)("should %s", (_desc, input, expectedResult) => {
        expect(attributeIdentifier(input)).toBe(expectedResult);
    });
});

describe("attributesFind", () => {
    const AttributeList = [Account.Default, Account.Name, Activity.Default, ActivityType];
    const Scenarios: Array<[string, any, any, IAttribute | undefined]> = [
        ["find first attribute if no predicate", AttributeList, undefined, Account.Default],
        ["find attribute by local id", AttributeList, attributeLocalId(Account.Name), Account.Name],
        ["find nothing if no local id match", AttributeList, "does not exist", undefined],
        ["find nothing if no predicate match", AttributeList, () => false, undefined],
        ["find nothing if empty list", [], attributeLocalId(Account.Name), undefined],
        ["find nothing if undefined list", undefined, attributeLocalId(Account.Name), undefined],
    ];

    it.each(Scenarios)("should %s", (_desc, inputList, findPredicate, expectedResult) => {
        expect(attributesFind(inputList, findPredicate)).toEqual(expectedResult);
    });
});
