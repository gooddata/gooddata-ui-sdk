// (C) 2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import {
    adoptHostBackend,
    backend,
    clearCache,
    isHostBackendAdopted,
    reinitializeBackend,
    resetCatalogs,
} from "../backend.js";
import { handleReceivedApiToken } from "../postMessageApi/sagas/api_token_received_saga.js";
import { storeApiToken } from "../store/application_context/app_context_actions.js";
import { selectApiToken, selectApiTokenType } from "../store/application_context/app_context_selector.js";

describe("adoptHostBackend", () => {
    afterEach(() => {
        // The backend module is a singleton — restore the own-backend state for other tests.
        reinitializeBackend();
        vi.restoreAllMocks();
    });

    it("should route backend calls to the host instance (with AD eventing on top)", () => {
        const instance = dummyBackend();
        const workspaceSpy = vi.spyOn(instance, "workspace");

        adoptHostBackend({ instance });
        backend.workspace("host-workspace");

        expect(workspaceSpy).toHaveBeenCalledWith("host-workspace");
        expect(isHostBackendAdopted).toBe(true);
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

    it("should be reverted by reinitializeBackend (own-backend path)", () => {
        adoptHostBackend({ instance: dummyBackend() });
        reinitializeBackend();

        expect(isHostBackendAdopted).toBe(false);
    });

    it("should keep the stored token in sync on SetApiToken without an AD-side auth provider", () => {
        // With an adopted backend there is no AD-side provider, so no update handler exists; the
        // renewal must not crash and must still record the token for components that read it.
        adoptHostBackend({ instance: dummyBackend() });

        const command = {
            gdc: {
                product: "analyticalDesigner",
                event: { name: "setApiToken", data: { token: "renewed-token", type: "gooddata" } },
            },
        } as Parameters<typeof handleReceivedApiToken>[0];

        return expectSaga(handleReceivedApiToken, command)
            .provide([
                [select(selectApiTokenType), "gooddata"],
                [select(selectApiToken), "previous-token"],
            ])
            .put(storeApiToken("renewed-token", "gooddata"))
            .run();
    });
});
