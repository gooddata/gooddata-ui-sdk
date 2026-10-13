// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { type IAuthenticationContext, NotAuthenticated } from "@gooddata/sdk-backend-spi";

import { createNotAuthenticatedHandler } from "./tigerNotAuthenticatedHandler.js";

const ctx = {} as IAuthenticationContext;
const error = new NotAuthenticated("Not authenticated");

describe("createNotAuthenticatedHandler", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("redirects on the first 401 without delay", () => {
        vi.useFakeTimers();
        const redirect = vi.fn();
        const handler = createNotAuthenticatedHandler(undefined, redirect);

        handler(ctx, error);

        expect(redirect).toHaveBeenCalledTimes(1);
    });

    it("redirects once for a burst of parallel 401s", () => {
        vi.useFakeTimers();
        const redirect = vi.fn();
        const handler = createNotAuthenticatedHandler(undefined, redirect);

        handler(ctx, error);
        handler(ctx, error);
        handler(ctx, error);
        vi.advanceTimersByTime(1000);

        expect(redirect).toHaveBeenCalledTimes(1);
    });
});
