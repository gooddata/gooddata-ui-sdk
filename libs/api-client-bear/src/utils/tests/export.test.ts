// (C) 2007-2019 GoodData Corporation
import { describe, expect, it } from "vitest";

import { isExportFinished } from "../export.js";

describe("export utils", () => {
    describe("isExportFinished", () => {
        it("should return true when response ended as success", async () => {
            const response = { status: 200 } as Response;
            expect(isExportFinished(response)).toBe(true);
        });

        it("should return false when response ended as bad error", () => {
            const response = { status: 400 } as Response;
            expect(isExportFinished(response)).toBe(true);
        });

        it("should return false when response ended as internal error", () => {
            const response = { status: 500 } as Response;
            expect(isExportFinished(response)).toBe(true);
        });
    });
});
