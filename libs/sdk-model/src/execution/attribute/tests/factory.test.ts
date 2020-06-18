// (C) 2019-2020 GoodData Corporation
import { modifyAttribute, newAttribute } from "../factory";
import { Account } from "../../../../__mocks__/model";

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
