// (C) 2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { type StaticProvider, throwError } from "redux-saga-test-plan/providers";
import { select } from "redux-saga/effects";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { validateEmbeddingOriginWithToken } from "@gooddata/sdk-backend-tiger";
import { type AdSetApiTokenCommandData, GdcAdCommandType, GdcProductName } from "@gooddata/sdk-embedding";
import { notifyValidatedCommandOrigin } from "@gooddata/sdk-embedding/internal";

import { setApiTokenHandler, setJwtHandler } from "../../backend.js";
import { backendInitialized } from "../../sagas/application_context/application_context_actions.js";
import { isEmbeddingOriginValidationEnabled } from "../../selectors/feature_flag_selector.js";
import { storeApiToken } from "../../store/application_context/app_context_actions.js";
import { selectApiToken, selectApiTokenType } from "../../store/application_context/app_context_selector.js";
import { hostVerificationErrored, hostVerificationFailed } from "../actions/command_error_actions.js";
import { postInvalidCommandArgument } from "../outgoing/invalid_command_events.js";

import { handleReceivedApiToken } from "./api_token_received_saga.js";

// The suite runs with `isolate: false`, so a sibling test file that loaded api_token_received_saga.ts first leaves it
// cached with the real backend.js. Drop the cache before this file's imports so the mock below applies.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../backend.js", () => ({
    isValidApiTokenType: (type?: string) => type === undefined || type === "gooddata" || type === "jwt",
    setApiTokenHandler: vi.fn(),
    setJwtHandler: vi.fn(),
}));

const ORIGIN = "https://embedder.example.com";
const CONTEXT_ID = "ctx-1";
const NEW_TOKEN = "new-token";
const NEW_JWT = "header.payload.signature";

function setApiTokenCommand(token: string, type: "gooddata" | "jwt" = "gooddata"): AdSetApiTokenCommandData {
    return {
        gdc: {
            product: GdcProductName.ANALYTICAL_DESIGNER,
            event: { name: GdcAdCommandType.SetApiToken, data: { token, type }, contextId: CONTEXT_ID },
        },
    };
}

interface IProviderOptions {
    validationEnabled: boolean;
    previousToken: string | undefined;
    previousTokenType: string | undefined;
    check: boolean | Error;
}

function providers(options: Partial<IProviderOptions> = {}): StaticProvider[] {
    const { validationEnabled, previousToken, previousTokenType, check }: IProviderOptions = {
        validationEnabled: true,
        previousToken: "previous-token",
        previousTokenType: "gooddata",
        check: true,
        ...options,
    };
    return [
        [select(isEmbeddingOriginValidationEnabled), validationEnabled],
        [select(selectApiToken), previousToken],
        [select(selectApiTokenType), previousTokenType],
        [
            matchers.call.fn(validateEmbeddingOriginWithToken),
            check instanceof Error ? throwError(check) : check,
        ],
        [matchers.call.fn(notifyValidatedCommandOrigin), undefined],
        [matchers.call.fn(postInvalidCommandArgument), undefined],
    ];
}

/** An axios error keeps the request configuration, with the token in the `Authorization` header. */
function axiosError(status: number): Error {
    return Object.assign(new Error(`Request failed with status code ${status}`), {
        isAxiosError: true,
        response: { status },
        config: { headers: { Authorization: `Bearer ${NEW_TOKEN}` } },
    });
}

describe("handleReceivedApiToken origin check", () => {
    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it("renews the token when the origin passes the check with the new token", async () => {
        await expectSaga(handleReceivedApiToken, setApiTokenCommand(NEW_TOKEN), ORIGIN)
            .provide(providers())
            .call(validateEmbeddingOriginWithToken, { token: NEW_TOKEN, origin: ORIGIN })
            .call(notifyValidatedCommandOrigin, ORIGIN)
            .put(storeApiToken(NEW_TOKEN, "gooddata"))
            .not.put(hostVerificationFailed(CONTEXT_ID))
            .run();

        expect(setApiTokenHandler).toHaveBeenCalledWith(NEW_TOKEN);
    });

    it("renews a JWT when the origin passes the check with the new JWT", async () => {
        await expectSaga(handleReceivedApiToken, setApiTokenCommand(NEW_JWT, "jwt"), ORIGIN)
            .provide(providers({ previousTokenType: "jwt" }))
            .call(validateEmbeddingOriginWithToken, { token: NEW_JWT, origin: ORIGIN })
            .put(storeApiToken(NEW_JWT, "jwt"))
            .run();

        expect(setJwtHandler).toHaveBeenCalledWith(NEW_JWT, 60);
    });

    it("drops the token and keeps the current one when the origin is denied", async () => {
        await expectSaga(handleReceivedApiToken, setApiTokenCommand(NEW_TOKEN), ORIGIN)
            .provide(providers({ check: false }))
            .put(hostVerificationFailed(CONTEXT_ID))
            .not.call(notifyValidatedCommandOrigin, ORIGIN)
            .not.put(storeApiToken(NEW_TOKEN, "gooddata"))
            .run();

        expect(setApiTokenHandler).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining(`Denied the new API token from the origin "${ORIGIN}"`),
        );
    });

    it.each([
        ["an invalid token or a token of another organization", axiosError(401)],
        [
            "a network error",
            Object.assign(new Error("Network Error"), { isAxiosError: true, code: "ERR_NETWORK" }),
        ],
    ])("drops the token on %s and does not log the token", async (_, error) => {
        await expectSaga(handleReceivedApiToken, setApiTokenCommand(NEW_TOKEN), ORIGIN)
            .provide(providers({ check: error }))
            .put(hostVerificationErrored(CONTEXT_ID))
            .not.put(storeApiToken(NEW_TOKEN, "gooddata"))
            .run();

        expect(setApiTokenHandler).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(warn.mock.calls)).not.toContain(NEW_TOKEN);
    });

    it("checks a first token sent over cookie authentication before it switches the backend", async () => {
        await expectSaga(handleReceivedApiToken, setApiTokenCommand(NEW_TOKEN), ORIGIN)
            .provide(providers({ previousToken: undefined, previousTokenType: undefined, check: false }))
            .put(hostVerificationFailed(CONTEXT_ID))
            .not.put(backendInitialized())
            .run();

        expect(setApiTokenHandler).not.toHaveBeenCalled();
    });

    it("switches the backend to a first token whose origin passes the check", async () => {
        await expectSaga(handleReceivedApiToken, setApiTokenCommand(NEW_TOKEN), ORIGIN)
            .provide(providers({ previousToken: undefined, previousTokenType: undefined }))
            .call(validateEmbeddingOriginWithToken, { token: NEW_TOKEN, origin: ORIGIN })
            .put(storeApiToken(NEW_TOKEN, "gooddata"))
            .put(backendInitialized())
            .run();

        expect(setApiTokenHandler).toHaveBeenCalledWith(NEW_TOKEN);
    });

    it("does not check a token that the installed host adapter injected", async () => {
        await expectSaga(handleReceivedApiToken, setApiTokenCommand(NEW_TOKEN), undefined)
            .provide(providers({ check: false }))
            .not.call.fn(validateEmbeddingOriginWithToken)
            .put(storeApiToken(NEW_TOKEN, "gooddata"))
            .run();

        expect(setApiTokenHandler).toHaveBeenCalledWith(NEW_TOKEN);
    });

    it("applies the token with no check when the validation is off", async () => {
        await expectSaga(handleReceivedApiToken, setApiTokenCommand(NEW_TOKEN), ORIGIN)
            .provide(providers({ validationEnabled: false, check: false }))
            .not.call.fn(validateEmbeddingOriginWithToken)
            .put(storeApiToken(NEW_TOKEN, "gooddata"))
            .run();

        expect(setApiTokenHandler).toHaveBeenCalledWith(NEW_TOKEN);
    });

    it("does not check a token with an invalid format", async () => {
        await expectSaga(handleReceivedApiToken, setApiTokenCommand(""), ORIGIN)
            .provide(providers())
            .not.call.fn(validateEmbeddingOriginWithToken)
            .run();
    });
});
