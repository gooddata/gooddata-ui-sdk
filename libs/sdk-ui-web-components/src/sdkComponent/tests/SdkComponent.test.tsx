// (C) 2019-2022 GoodData Corporation
import { functionInternalToThisComponent } from "../SdkComponent";

describe("functionInternalToThisComponent", () => {
    it("returns Hello World!", () => {
        expect(functionInternalToThisComponent("World")).toEqual("Hello World!");
    });
});
