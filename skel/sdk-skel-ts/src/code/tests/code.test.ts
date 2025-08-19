// (C) 2019-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { mySdkFunction } from "../code";

describe("mySdkFunction", () => {
    it("returns Hello World!", () => {
        expect(mySdkFunction("World")).toEqual("Hello World!");
    });
});
