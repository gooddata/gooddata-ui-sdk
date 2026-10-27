// (C) 2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import {
    adoptHostBackend,
    backend,
    clearCache,
    resetBackend,
    resetCatalogs,
    setApiTokenHandler,
    setJwtHandler,
} from "../backend.js";
import { handleReceivedApiToken } from "../postMessageApi/sagas/api_token_received_saga.js";
import { backendInitialized } from "../sagas/application_context/application_context_actions.js";
import { storeApiToken } from "../store/application_context/app_context_actions.js";
import { selectApiToken, selectApiTokenType } from "../store/application_context/app_context_selector.js";

const setApiTokenCommand = (token: string, type: "gooddata" | "jwt") =>
    ({
        gdc: {
            product: "analyticalDesigner",
            event: { name: "setApiToken", data: { token, type } },
        },
    }) as Parameters<typeof handleReceivedApiToken>[0];

describe("adoptHostBackend", () => {
    afterEach(() => {
        // The backend module is a singleton — restore the uninitialized state for other tests.
        resetBackend();
        vi.restoreAllMocks();
    });

    it("should route backend calls to the host instance (with AD eventing on top)", () => {
        const instance = dummyBackend();
        const workspaceSpy = vi.spyOn(instance, "workspace");

        adoptHostBackend({ instance });
        backend.workspace("host-workspace");

        expect(workspaceSpy).toHaveBeenCalledWith("host-workspace");
    });

    it("should wire cache invalidation refs to the host callbacks", () => {
        const resetAllCaches = vi.fn();
        const hostResetCatalogs = vi.fn();

        adoptHostBackend({ instance: dummyBackend(), resetAllCaches, resetCatalogs: hostResetCatalogs });
        clearCache();
        resetCatalogs();

        expect(resetAllCaches).toHaveBeenCalledTimes(1);
        expect(hostResetCatalogs).toHaveBeenCalledTimes(1);
    });

    it("should fall back to no-op cache refs when the host provides none", () => {
        adoptHostBackend({ instance: dummyBackend() });

        expect(() => {
            clearCache();
            resetCatalogs();
        }).not.toThrow();
    });

    it("should wire the token renewal refs to the host setters", () => {
        const setApiToken = vi.fn();
        const setJwt = vi.fn();

        adoptHostBackend({ instance: dummyBackend(), setApiToken, setJwt });

        expect(setApiTokenHandler).toBe(setApiToken);
        expect(setJwtHandler).toBe(setJwt);
    });

    it("should be reverted by resetBackend", () => {
        adoptHostBackend({ instance: dummyBackend(), setApiToken: vi.fn() });
        resetBackend();

        expect(setApiTokenHandler).toBeUndefined();
        expect(() => backend.workspace("ws")).toThrow("Backend API cannot be used");
    });

    it("should renew the host token on SetApiToken when the host provides a setter", () => {
        const setApiToken = vi.fn();
        adoptHostBackend({ instance: dummyBackend(), setApiToken });

        return expectSaga(handleReceivedApiToken, setApiTokenCommand("renewed-token", "gooddata"))
            .provide([
                [select(selectApiTokenType), "gooddata"],
                [select(selectApiToken), "previous-token"],
            ])
            .put(storeApiToken("renewed-token", "gooddata"))
            .run()
            .then(() => {
                expect(setApiToken).toHaveBeenCalledWith("renewed-token");
            });
    });

    it("should hand the first injected token to the host setter and flag the backend as initialized", () => {
        const setApiToken = vi.fn();
        adoptHostBackend({ instance: dummyBackend(), setApiToken });

        return expectSaga(handleReceivedApiToken, setApiTokenCommand("first-token", "gooddata"))
            .provide([
                [select(selectApiTokenType), undefined],
                [select(selectApiToken), undefined],
            ])
            .put(storeApiToken("first-token", "gooddata"))
            .put(backendInitialized())
            .run()
            .then(() => {
                expect(setApiToken).toHaveBeenCalledWith("first-token");
            });
    });

    it("should keep the stored token in sync on SetApiToken when the host renews its provider itself", () => {
        // Without a setter the renewal must not crash and must still record the token for the
        // components that read it.
        adoptHostBackend({ instance: dummyBackend() });

        return expectSaga(handleReceivedApiToken, setApiTokenCommand("renewed-token", "gooddata"))
            .provide([
                [select(selectApiTokenType), "gooddata"],
                [select(selectApiToken), "previous-token"],
            ])
            .put(storeApiToken("renewed-token", "gooddata"))
            .run();
    });
});
