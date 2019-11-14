// (C) 2019 GoodData Corporation
import { newAttribute } from "../factory";

describe("attribute factory", () => {
    describe("visualizationAttribute", () => {
        it("should return a simple attribute", () => {
            expect(newAttribute("foo")).toMatchSnapshot();
        });

        it("should return an attribute with an alias", () => {
            expect(newAttribute("foo", a => a.alias("alias"))).toMatchSnapshot();
        });

        it("should return an attribute with a custom localId", () => {
            expect(newAttribute("foo", a => a.localId("custom"))).toMatchSnapshot();
        });
    });
});
