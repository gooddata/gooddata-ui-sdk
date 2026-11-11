// (C) 2026 GoodData Corporation

import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type ValidateEmbeddingOriginResponse } from "@gooddata/api-client-tiger";
import { ActionsApi_ValidateEmbeddingOrigin } from "@gooddata/api-client-tiger/endpoints/actions";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { SecuritySettingsService } from "./securitySettings.js";

vi.mock("@gooddata/api-client-tiger/endpoints/actions", () => ({
    ActionsApi_ValidateEmbeddingOrigin: vi.fn(),
}));

const ORIGIN = "https://app.example.com";
const client = { axios: {}, basePath: "" };

function response(valid: boolean) {
    return { data: { valid } } as AxiosResponse<ValidateEmbeddingOriginResponse>;
}

describe("SecuritySettingsService", () => {
    const authCall = vi.fn((callback) => callback(client));
    const service = new SecuritySettingsService("org", authCall as unknown as TigerAuthenticatedCallGuard);

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    describe("isUrlValid with the UI_EVENT context", () => {
        it("should resolve true when the backend answers valid", async () => {
            vi.mocked(ActionsApi_ValidateEmbeddingOrigin).mockResolvedValue(response(true));

            await expect(service.isUrlValid(ORIGIN, "UI_EVENT")).resolves.toBe(true);
            expect(ActionsApi_ValidateEmbeddingOrigin).toHaveBeenCalledWith(client.axios, client.basePath, {
                validateEmbeddingOriginRequest: { origin: ORIGIN },
            });
        });

        it("should resolve false when the backend answers not valid", async () => {
            vi.mocked(ActionsApi_ValidateEmbeddingOrigin).mockResolvedValue(response(false));

            await expect(service.isUrlValid(ORIGIN, "UI_EVENT")).resolves.toBe(false);
        });

        it("should reject on an authentication error", async () => {
            const error = new AxiosError("Unauthorized", "401", undefined, undefined, {
                status: 401,
            } as AxiosResponse);
            vi.mocked(ActionsApi_ValidateEmbeddingOrigin).mockRejectedValue(error);

            await expect(service.isUrlValid(ORIGIN, "UI_EVENT")).rejects.toBe(error);
        });

        it("should reject on a network error", async () => {
            const error = new AxiosError("Network Error", AxiosError.ERR_NETWORK);
            vi.mocked(ActionsApi_ValidateEmbeddingOrigin).mockRejectedValue(error);

            await expect(service.isUrlValid(ORIGIN, "UI_EVENT")).rejects.toBe(error);
        });
    });

    it.each(["CORS", "DRILL_TO_URI"] as const)(
        "should resolve true for the %s context without a backend call",
        async (context) => {
            await expect(service.isUrlValid(ORIGIN, context)).resolves.toBe(true);
            expect(ActionsApi_ValidateEmbeddingOrigin).not.toHaveBeenCalled();
        },
    );
});
