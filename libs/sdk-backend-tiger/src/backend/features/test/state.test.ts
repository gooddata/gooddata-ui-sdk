// (C) 2020-2022 GoodData Corporation

import { convertState } from "../state";

describe("state convert", () => {
    it("to true", () => {
        expect(convertState("ENABLED")).toEqual(true);
        expect(convertState("enabled")).toEqual(true);
        expect(convertState("EnABlED")).toEqual(true);
    });

    it("to false", () => {
        expect(convertState("DISABLED")).toEqual(false);
        expect(convertState("disabled")).toEqual(false);
        expect(convertState("DiSaBLeD")).toEqual(false);
    });

    it("to undefined", () => {
        expect(convertState("dfdfdf")).toEqual(undefined);
        expect(convertState("")).toEqual(undefined);
        expect(convertState("0")).toEqual(undefined);
    });
});
