// (C) 2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { afterEach, describe, expect, it } from "vitest";

import { GdcAdCommandType, GdcProductName } from "@gooddata/sdk-embedding";

import { type AdCommandEnvelope, HOST_ADAPTER_ORIGIN } from "../../embedding/hostBridge.js";
import {
    activateHostCommandOwner,
    closeHostCommandDelivery,
    deactivateHostCommandOwner,
    isHostCommandDeliveryOpen,
    openHostCommandDelivery,
} from "../../embedding/hostCommandGate.js";
import { sendCommandToAd } from "../../embedding/hostCommands.js";
import { commandReceived } from "../actions/command_received_actions.js";

import { deliverHostCommands } from "./host_command_delivery_saga.js";

const command = (name: GdcAdCommandType): AdCommandEnvelope =>
    ({
        gdc: { product: GdcProductName.ANALYTICAL_DESIGNER, event: { name, data: null } },
    }) as AdCommandEnvelope;

describe("host command delivery", () => {
    afterEach(() => {
        openHostCommandDelivery();
        closeHostCommandDelivery();
    });

    it("keeps the commands a mounted component sends before AD listens", () => {
        const owner = {};
        const clear = command(GdcAdCommandType.Clear);
        activateHostCommandOwner(owner);

        sendCommandToAd(clear, owner);

        expect(isHostCommandDeliveryOpen()).toBe(false);
        expect(openHostCommandDelivery()).toEqual([clear]);
    });

    it("delivers the kept commands in order once the watchers listen, and closes on cancel", async () => {
        const owner = {};
        const clear = command(GdcAdCommandType.Clear);
        const cancel = command(GdcAdCommandType.RequestCancellation);
        activateHostCommandOwner(owner);
        sendCommandToAd(clear, owner);
        sendCommandToAd(cancel, owner);

        await expectSaga(deliverHostCommands)
            .put(commandReceived(clear, HOST_ADAPTER_ORIGIN))
            .put(commandReceived(cancel, HOST_ADAPTER_ORIGIN))
            .silentRun(50);

        expect(isHostCommandDeliveryOpen()).toBe(false);
    });

    it("drops the commands of a component that unmounted before AD listened", () => {
        const unmounted = {};
        const mounted = {};
        const clear = command(GdcAdCommandType.Clear);
        const cancel = command(GdcAdCommandType.RequestCancellation);
        activateHostCommandOwner(unmounted);
        sendCommandToAd(clear, unmounted);
        deactivateHostCommandOwner(unmounted);
        activateHostCommandOwner(mounted);
        sendCommandToAd(cancel, mounted);

        expect(openHostCommandDelivery()).toEqual([cancel]);
    });

    it("keeps the commands of a component that mounted again, as React StrictMode does", () => {
        const owner = {};
        const clear = command(GdcAdCommandType.Clear);
        sendCommandToAd(clear, owner);
        activateHostCommandOwner(owner);
        deactivateHostCommandOwner(owner);
        activateHostCommandOwner(owner);

        expect(openHostCommandDelivery()).toEqual([clear]);
    });
});
