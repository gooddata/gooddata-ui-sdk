// (C) 2019-2021 GoodData Corporation
import { mySdkFunction } from "../code";

describe("mySdkFunction", () => {
    it("returns Hello World!", () => {
        expect(mySdkFunction("World")).toEqual("Hello World!");
    });
});
