// (C) 2019 GoodData Corporation
import { describe, it, expect } from "vitest";
import { functionInternalToThisComponent } from "../SdkComponent";

describe("functionInternalToThisComponent", () => {
    it("returns Hello World!", () => {
        expect(functionInternalToThisComponent("World")).toEqual("Hello World!");
    });
});
