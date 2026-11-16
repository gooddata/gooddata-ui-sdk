// (C) 2007-2026 GoodData Corporation

import {
    type GdcMessageEventListener,
    type IGdcMessageEvent,
    type IGdcMessageEventListenerConfig,
} from "../iframe/common.js";

import { type EventSender, routeEvent } from "./originGate.js";

/**
 * @internal
 */
export interface IHost {
    postMessage?: Window["postMessage"];
    parent?: IHost;
}

//
//
//

let host: IHost;
try {
    host = parent; // do not use check `typeof parent` due to IE11 "Access denied error", instead wrap by try/catch
} catch {
    host = {}; // use mocked host object when running in node (e2e tests)
}

interface IReceiverEntry {
    listener: GdcMessageEventListener;
    receiver: GdcMessageEventListener;
}

const receivers: IReceiverEntry[] = [];

let config: IGdcMessageEventListenerConfig = {
    product: "",
    validReceivedPostEvents: [],
};

const receiveListener =
    (listener: GdcMessageEventListener): GdcMessageEventListener =>
    (event: IGdcMessageEvent<string, string, any>) => {
        return event?.data?.gdc?.product === config.product &&
            // check for valid incoming command
            config.validReceivedPostEvents.includes(event?.data?.gdc?.event?.name)
            ? listener(event)
            : false;
    };

//
//
//

/**
 * Set post message target - useful for unit tests.
 *
 * @internal
 */
export const setHost = (h: IHost): void => {
    host = h;
};

/**
 * @internal
 */
export function setConfig(product: string, validReceivedPostEvents: string[]): void {
    config = { product, validReceivedPostEvents };
}

/**
 * @internal
 */
export function addListener(listener: GdcMessageEventListener, target = window): void {
    const receiver = receiveListener(listener);
    receivers.push({ listener, receiver });
    target.addEventListener("message", receiver, false);
}

/**
 * @internal
 */
export function removeListener(listener: GdcMessageEventListener, target = window): void {
    const receiverObj = receivers.find((r) => r.listener === listener);
    if (receiverObj) {
        receivers.splice(receivers.indexOf(receiverObj), 1);
        target.removeEventListener("message", receiverObj.receiver);
    }
}

/**
 * Options of {@link postEvent}.
 *
 * @internal
 */
export interface IPostEventOptions {
    /**
     * Posts the event to `*` at once, around the origin gate. Only for an event that must reach a
     * parent before its origin is known, such as `listeningForApiToken`.
     */
    exempt?: boolean;
}

const sendToHost: EventSender = (message, targetOrigin) => {
    host.postMessage?.(message, targetOrigin);
};

/**
 * Posts an event to the parent window. The event goes through the origin gate (see `originGate.ts`),
 * which by default posts it to `*` at once.
 *
 * @internal
 */
export function postEvent(
    product: string,
    name: string,
    data: object,
    contextId?: string,
    options?: IPostEventOptions,
): void {
    if (!host.postMessage) {
        return;
    }
    const message = {
        gdc: {
            product,
            event: { name, data, contextId },
        },
    };
    if (options?.exempt) {
        sendToHost(message, "*");
        return;
    }
    routeEvent(message, sendToHost);
}

export const messagingUtils = {
    setHost,
    setConfig,
    addListener,
    removeListener,
    postEvent,
};
