// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { UnexpectedResponseError } from "@gooddata/sdk-backend-spi";

import { getUpdateErrorMessage } from "./updateErrorMessage.js";

describe("getUpdateErrorMessage", () => {
    it("says the item is gone when the save answers 404", () => {
        const error = new UnexpectedResponseError("Request failed with status code 404", 404, {});

        expect(getUpdateErrorMessage(error)).toEqual({
            message: { id: "analyticsCatalog.catalogItem.update.notFound" },
        });
    });

    it("keeps the generic message with the detail for any other failure", () => {
        const error = new UnexpectedResponseError("Request failed with status code 500", 500, {});

        expect(getUpdateErrorMessage(error)).toEqual({
            message: { id: "analyticsCatalog.catalogItem.update.failed" },
            errorDetail: "Error Request failed with status code 500",
        });
    });

    it("keeps the generic message for a non-backend error", () => {
        expect(getUpdateErrorMessage(new TypeError("boom"))).toEqual({
            message: { id: "analyticsCatalog.catalogItem.update.failed" },
            errorDetail: "TypeError boom",
        });
    });
});
