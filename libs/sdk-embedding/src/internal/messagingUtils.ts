// (C) 2007-2022 GoodData Corporation
import {
    GdcMessageEventListener,
    IGdcMessageEventListenerConfig,
    IGdcMessageEvent,
} from "../iframe/common.js";

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
    // eslint-disable-next-line no-restricted-globals
    host = parent; // do not use check `typeof parent` due to IE11 "Access denied error", instead wrap by try/catch
} catch (e) {
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
 * @internal
 */
export function postEvent(product: string, name: string, data: object, contextId?: string): void {
    if (!host.postMessage) {
        return;
    }
    host.postMessage(
        {
            gdc: {
                product,
                event: { name, data, contextId },
            },
        },
        "*",
    );
}
