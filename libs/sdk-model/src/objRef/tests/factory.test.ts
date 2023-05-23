// (C) 2020 GoodData Corporation
import { idRef, uriRef, localIdRef } from "../factory.js";

describe("idRef", () => {
    it("creates a simple id ref", () => {
        expect(idRef("foo")).toMatchSnapshot();
    });
});

describe("uriRef", () => {
    it("creates a simple URI ref", () => {
        expect(uriRef("foo")).toMatchSnapshot();
    });
});

describe("localIdRef", () => {
    it("creates a simple local id ref", () => {
        expect(localIdRef("foo")).toMatchSnapshot();
    });
});
