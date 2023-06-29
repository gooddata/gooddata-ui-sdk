// (C) 2019-2020 GoodData Corporation
import { isEmail } from "../validate.js";
import { describe, it, expect } from "vitest";

describe("isEmail", () => {
    it.each([
        [true, "testEmailAddress@gooddata.com"],
        [false, "testEmail@"],
    ])("should return is %s", (expected: boolean, email: string) => {
        expect(isEmail(email)).toEqual(expected);
    });
});
