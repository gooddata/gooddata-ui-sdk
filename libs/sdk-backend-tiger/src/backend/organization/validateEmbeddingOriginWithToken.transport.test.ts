// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { validateEmbeddingOriginWithToken } from "./validateEmbeddingOriginWithToken.js";

/**
 * Checks the request that goes to the transport, not the axios configuration: an XMLHttpRequest
 * sends the cookies of a same-origin request also with `withCredentials` set to `false`.
 */
const params = { token: "token-1", origin: "https://app.example.com", hostname: "https://gd.example.com" };

describe("validateEmbeddingOriginWithToken transport", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("should send the token and omit cookies", async () => {
        const fetchMock = vi.fn(
            async () =>
                new Response(JSON.stringify({ valid: true }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }),
        );
        vi.stubGlobal("fetch", fetchMock);

        await expect(validateEmbeddingOriginWithToken(params)).resolves.toBe(true);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [input, init] = fetchMock.mock.calls[0] as unknown as [Request | string, RequestInit];
        const request = new Request(input, init);
        expect(request.url).toBe("https://gd.example.com/api/v1/actions/validateEmbeddingOrigin");
        expect(request.credentials).toBe("omit");
        expect(request.headers.get("Authorization")).toBe("Bearer token-1");
    });

    // The callers log only the status or the error code, because the axios error keeps the token.
    it("should reject with an axios error that has the status", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response("", { status: 401 })),
        );

        await expect(validateEmbeddingOriginWithToken(params)).rejects.toMatchObject({
            isAxiosError: true,
            response: { status: 401 },
        });
    });

    it("should reject with an axios network error when the request fails", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => {
                throw new TypeError("Failed to fetch");
            }),
        );

        await expect(validateEmbeddingOriginWithToken(params)).rejects.toMatchObject({
            isAxiosError: true,
            code: "ERR_NETWORK",
        });
    });
});
