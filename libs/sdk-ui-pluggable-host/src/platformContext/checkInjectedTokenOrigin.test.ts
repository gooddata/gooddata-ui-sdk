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

    it("rejects as a denial when the origin is not valid", async () => {
        validateEmbeddingOriginWithToken.mockResolvedValue(false);

        const rejection = checkInjectedTokenOrigin(injected, settings(true));
        await expect(rejection).rejects.toBeInstanceOf(EmbeddingOriginRejectedError);
        await expect(rejection).rejects.toMatchObject({
            isCheckFailed: false,
            message: `The embedding parent origin "${injected.origin}" is not allowed.`,
        });
    });

    it("rejects as a failed check, not as a denial, when the check fails", async () => {
        validateEmbeddingOriginWithToken.mockRejectedValue(new Error("Network Error"));

        const rejection = checkInjectedTokenOrigin(injected, settings(true));
        await expect(rejection).rejects.toBeInstanceOf(EmbeddingOriginRejectedError);
        await expect(rejection).rejects.toMatchObject({
            isCheckFailed: true,
            message: `Could not check if the embedding parent origin "${injected.origin}" is allowed (Network Error). Load the page again to try again.`,
        });
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
