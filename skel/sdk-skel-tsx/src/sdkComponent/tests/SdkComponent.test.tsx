// (C) 2019-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { functionInternalToThisComponent } from "../SdkComponent";

describe("functionInternalToThisComponent", () => {
    it("returns Hello World!", () => {
        expect(functionInternalToThisComponent("World")).toEqual("Hello World!");
    });
});
