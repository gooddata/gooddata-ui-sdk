// (C) 2026 GoodData Corporation

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { type IUserSettings } from "@gooddata/sdk-model";

type CheckModule = typeof import("./checkInjectedTokenOrigin.js");

const { validateEmbeddingOriginWithToken } = vi.hoisted(() => ({
    validateEmbeddingOriginWithToken: vi.fn(),
}));

const injected = {
    token: "secret",
    type: "gooddata" as const,
    origin: "https://parent.example.com",
    isFromParent: true,
};

function settings(enableEmbeddingOriginValidation: boolean): IUserSettings {
    return { userId: "user", locale: "en-US", enableEmbeddingOriginValidation } as IUserSettings;
}

describe("checkInjectedTokenOrigin", () => {
    let checkInjectedTokenOrigin: CheckModule["checkInjectedTokenOrigin"];
    let EmbeddingOriginRejectedError: CheckModule["EmbeddingOriginRejectedError"];

    // The package shares one module registry between test files (isolate: false), so this file loads
    // its own copy with the mock and drops it afterwards.
    beforeAll(async () => {
        vi.resetModules();
        vi.doMock("@gooddata/sdk-backend-tiger", () => ({ validateEmbeddingOriginWithToken }));
        ({ checkInjectedTokenOrigin, EmbeddingOriginRejectedError } =
            await import("./checkInjectedTokenOrigin.js"));
    });

    afterAll(() => {
        vi.doUnmock("@gooddata/sdk-backend-tiger");
        vi.resetModules();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("makes no call and returns undefined when origin validation is off", async () => {
        await expect(checkInjectedTokenOrigin(injected, settings(false))).resolves.toBeUndefined();
        expect(validateEmbeddingOriginWithToken).not.toHaveBeenCalled();
    });

    it("checks the origin with the injected token and returns it when valid", async () => {
        validateEmbeddingOriginWithToken.mockResolvedValue(true);

        await expect(checkInjectedTokenOrigin(injected, settings(true))).resolves.toBe(injected.origin);
        expect(validateEmbeddingOriginWithToken).toHaveBeenCalledWith({
            token: "secret",
            origin: injected.origin,
        });
    });

    it("rejects when the origin is not valid", async () => {
        validateEmbeddingOriginWithToken.mockResolvedValue(false);

        await expect(checkInjectedTokenOrigin(injected, settings(true))).rejects.toBeInstanceOf(
            EmbeddingOriginRejectedError,
        );
    });

    it("rejects when the check fails", async () => {
        validateEmbeddingOriginWithToken.mockRejectedValue(new Error("401"));

        await expect(checkInjectedTokenOrigin(injected, settings(true))).rejects.toBeInstanceOf(
            EmbeddingOriginRejectedError,
        );
    });

    it("keeps only the status of a failed request, not the request with the token", async () => {
        validateEmbeddingOriginWithToken.mockRejectedValue({
            isAxiosError: true,
            config: { headers: { Authorization: "Bearer secret" } },
            response: { status: 401 },
        });

        await expect(checkInjectedTokenOrigin(injected, settings(true))).rejects.toMatchObject({
            cause: "HTTP 401",
        });
    });
});
