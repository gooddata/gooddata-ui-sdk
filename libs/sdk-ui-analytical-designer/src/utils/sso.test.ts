// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { SSO_LOGIN_COOKIE, isLoggedInViaSso } from "./sso.js";

describe("#sso", () => {
    describe("isLoggedInViaSso", () => {
        it("should return false if SSO cookie is not present", () => {
            expect(isLoggedInViaSso({ cookie: "abcdefghabcdefgh" } as Document)).toEqual(false);
        });

        it("should return true if SSO cookie is present", () => {
            expect(isLoggedInViaSso({ cookie: `abcdefgh${SSO_LOGIN_COOKIE}abcdefgh` } as Document)).toEqual(
                true,
            );
        });
    });
});
