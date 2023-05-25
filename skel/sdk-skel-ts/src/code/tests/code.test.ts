// (C) 2019 GoodData Corporation
import { describe, it, expect } from "vitest";
import { mySdkFunction } from "../code";

describe("mySdkFunction", () => {
    it("returns Hello World!", () => {
        expect(mySdkFunction("World")).toEqual("Hello World!");
    });
});
