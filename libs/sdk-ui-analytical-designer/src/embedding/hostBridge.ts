// (C) 2026 GoodData Corporation

import { type AdCommandData } from "@gooddata/sdk-embedding";

/** Envelope of an incoming AD command — the exact shape the postMessage transport delivers. */
export type AdCommandEnvelope = AdCommandData;

/** One outgoing AD event — exactly what messagingUtils.postEvent would have wrapped. */
export interface IAdOutgoingEvent<TData = unknown> {
    product: string;
    name: string;
    /** the @gooddata/sdk-embedding contract payload for `name` — opaque to the bridge itself */
    data: TData;
    contextId?: string;
}

/**
 * Transport adapter installed by a host that renders AD in-process (as a React component) instead
 * of in an iframe. While installed, every outgoing AD event is delivered to onEvent INSTEAD of
 * being posted as a window message; with no adapter installed the postMessage behavior is
 * unchanged. The host must never touch messagingUtils (a bundle-wide singleton shared with the
 * host's own embedded postMessage API).
 */
export interface IAdHostAdapter {
    onEvent(event: IAdOutgoingEvent): void;
}

/**
 * Sentinel origin marking commands injected in-process through the host adapter. Commands with
 * this origin skip the backend host-domain validation: the sentinel is only reachable from
 * in-process code (the postMessage listener is not registered in hosted-component mode), never
 * from a window message.
 */
export const HOST_ADAPTER_ORIGIN = "urn:gooddata:ad-host-adapter";

let hostAdapter: IAdHostAdapter | null = null;

export function installHostAdapter(adapter: IAdHostAdapter): () => void {
    hostAdapter = adapter;
    return () => {
        if (hostAdapter === adapter) {
            hostAdapter = null;
        }
    };
}

export function getHostAdapter(): IAdHostAdapter | null {
    return hostAdapter;
}
