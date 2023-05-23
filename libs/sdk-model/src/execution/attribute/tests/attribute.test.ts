// (C) 2019-2020 GoodData Corporation
import {
    attributeIdentifier,
    attributeLocalId,
    attributesFind,
    attributeUri,
    IAttribute,
    attributeAlias,
    attributeDisplayFormRef,
} from "../index.js";
import { Account, Activity, ActivityType } from "../../../../__mocks__/model.js";
import { ObjRef } from "../../../objRef/index.js";

const UriDefinedAttribute: IAttribute = {
    attribute: {
        localIdentifier: "a_uri.defined",
        displayForm: {
            uri: "/gdc/uri/should/not/be/used",
        },
    },
};

const AttributeWithAlias: IAttribute = {
    attribute: {
        ...Account.Default.attribute,
        alias: "alias",
    },
};

const InvalidScenarios: Array<[string, any]> = [
    ["attribute undefined", undefined],
    ["attribute null", null],
];

describe("attributeLocalId", () => {
    it("should return local identifier", () => {
        expect(attributeLocalId(Account.Default)).toEqual("a_label.account.id");
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => attributeLocalId(input)).toThrow();
    });
});

describe("attributeUri", () => {
    const Scenarios: Array<[string, any, any]> = [
        ["return URI if attribute defined as such", UriDefinedAttribute, "/gdc/uri/should/not/be/used"],
        ["return undefined if attribute defined with identifier", Account.Default, undefined],
    ];

    it.each(Scenarios)("should %s", (_desc, input, expectedResult) => {
        expect(attributeUri(input)).toBe(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => attributeUri(input)).toThrow();
    });
});

describe("attributeIdentifier", () => {
    const Scenarios: Array<[string, any, any]> = [
        ["return undefined if attribute defined with URI", UriDefinedAttribute, undefined],
        ["return identifier if attribute defined as such", Account.Default, "label.account.id"],
    ];

    it.each(Scenarios)("should %s", (_desc, input, expectedResult) => {
        expect(attributeIdentifier(input)).toBe(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => attributeIdentifier(input)).toThrow();
    });
});

describe("attributeAlias", () => {
    const Scenarios: Array<[string, any, any]> = [
        ["return undefined if attribute has no alias", Account.Default, undefined],
        ["return identifier if attribute defined as such", AttributeWithAlias, "alias"],
    ];

    it.each(Scenarios)("should %s", (_desc, input, expectedResult) => {
        expect(attributeAlias(input)).toBe(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => attributeAlias(input)).toThrow();
    });
});

describe("attributeAttributeDisplayFormObjRef", () => {
    const Scenarios: Array<[string, any, ObjRef]> = [
        [
            "return id ref if attribute has id ref",
            Account.Default,
            { identifier: "label.account.id", type: "displayForm" },
        ],
        [
            "return uri ref if attribute defined as such",
            UriDefinedAttribute,
            { uri: "/gdc/uri/should/not/be/used" },
        ],
    ];

    it.each(Scenarios)("should %s", (_desc, input, expectedResult) => {
        expect(attributeDisplayFormRef(input)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => attributeDisplayFormRef(input)).toThrow();
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
    ];

    it.each(Scenarios)("should %s", (_desc, inputList, findPredicate, expectedResult) => {
        expect(attributesFind(inputList, findPredicate)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => attributesFind(input)).toThrow();
    });
});
