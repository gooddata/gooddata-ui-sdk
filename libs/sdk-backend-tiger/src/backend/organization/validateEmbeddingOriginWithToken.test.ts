// (C) 2026 GoodData Corporation

import { AxiosError, type AxiosInstance, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type ValidateEmbeddingOriginResponse, defaultTigerClient } from "@gooddata/api-client-tiger";
import { ActionsApi_ValidateEmbeddingOrigin } from "@gooddata/api-client-tiger/endpoints/actions";

import { validateEmbeddingOriginWithToken } from "./validateEmbeddingOriginWithToken.js";

vi.mock("@gooddata/api-client-tiger/endpoints/actions", () => ({
    ActionsApi_ValidateEmbeddingOrigin: vi.fn(),
}));

const params = { token: "token-1", origin: "https://app.example.com", hostname: "https://gd.example.com" };

function response(valid: boolean) {
    return { data: { valid } } as AxiosResponse<ValidateEmbeddingOriginResponse>;
}

// The shared instance that the default client and every backend without its own axios use.
const globalTigerAxios = defaultTigerClient.axios;

function usedAxios(): AxiosInstance {
    return vi.mocked(ActionsApi_ValidateEmbeddingOrigin).mock.calls[0][0];
}

describe("validateEmbeddingOriginWithToken", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should resolve true when the backend answers valid", async () => {
        vi.mocked(ActionsApi_ValidateEmbeddingOrigin).mockResolvedValue(response(true));

        await expect(validateEmbeddingOriginWithToken(params)).resolves.toBe(true);
        expect(ActionsApi_ValidateEmbeddingOrigin).toHaveBeenCalledWith(expect.anything(), "", {
            validateEmbeddingOriginRequest: { origin: params.origin },
        });
    });

    it("should resolve false and not reject when the backend answers not valid", async () => {
        vi.mocked(ActionsApi_ValidateEmbeddingOrigin).mockResolvedValue(response(false));

        await expect(validateEmbeddingOriginWithToken(params)).resolves.toBe(false);
    });

    it("should reject on an authentication error", async () => {
        const error = new AxiosError("Unauthorized", "401", undefined, undefined, {
            status: 401,
        } as AxiosResponse);
        vi.mocked(ActionsApi_ValidateEmbeddingOrigin).mockRejectedValue(error);

        await expect(validateEmbeddingOriginWithToken(params)).rejects.toBe(error);
    });

    it("should reject on a network error", async () => {
        const error = new AxiosError("Network Error", AxiosError.ERR_NETWORK);
        vi.mocked(ActionsApi_ValidateEmbeddingOrigin).mockRejectedValue(error);

        await expect(validateEmbeddingOriginWithToken(params)).rejects.toBe(error);
    });

    it("should send only the given token on a new axios instance", async () => {
        vi.mocked(ActionsApi_ValidateEmbeddingOrigin).mockResolvedValue(response(true));

        await validateEmbeddingOriginWithToken(params);

        const instance = usedAxios();
        expect(instance).not.toBe(globalTigerAxios);
        expect(instance.defaults.baseURL).toBe(params.hostname);
        expect(instance.defaults.headers.common["Authorization"]).toBe("Bearer token-1");
        expect(instance.defaults.withCredentials).toBe(false);
        expect(globalTigerAxios.defaults.headers.common["Authorization"]).toBeUndefined();
    });

    it("should use a new axios instance for every call", async () => {
        vi.mocked(ActionsApi_ValidateEmbeddingOrigin).mockResolvedValue(response(true));

        await validateEmbeddingOriginWithToken(params);
        await validateEmbeddingOriginWithToken({ ...params, token: "token-2" });

        const [first, second] = vi
            .mocked(ActionsApi_ValidateEmbeddingOrigin)
            .mock.calls.map(([axios]) => axios);
        expect(second).not.toBe(first);
        expect(first.defaults.headers.common["Authorization"]).toBe("Bearer token-1");
        expect(second.defaults.headers.common["Authorization"]).toBe("Bearer token-2");
    });
});
