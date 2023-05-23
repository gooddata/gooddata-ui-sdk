// (C) 2019-2021 GoodData Corporation
import { modifyAttribute, newAttribute } from "../factory.js";
import { Account } from "../../../../__mocks__/model.js";

describe("newAttribute", () => {
    it("should return a simple attribute", () => {
        expect(newAttribute("foo")).toMatchSnapshot();
    });

    it("should return an attribute with an alias", () => {
        expect(newAttribute("foo", (a) => a.alias("alias"))).toMatchSnapshot();
    });

    it("should return an attribute with a custom localId", () => {
        expect(newAttribute("foo", (a) => a.localId("custom"))).toMatchSnapshot();
    });

    it("should sanitize automatically generated localId", () => {
        expect(newAttribute("id:with:colons")).toMatchSnapshot();
    });
});

describe("modifyAttribute", () => {
    it("should keep localId if one not provided during modification", () => {
        expect(modifyAttribute(Account.Name, (m) => m.alias("My Account Name"))).toMatchSnapshot();
    });

    it("should use localId provided during modification", () => {
        expect(
            modifyAttribute(Account.Name, (m) => m.alias("My Account Name").localId("my_custom_id")),
        ).toMatchSnapshot();
    });
});
