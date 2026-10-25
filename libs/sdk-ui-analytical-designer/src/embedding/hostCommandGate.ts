// (C) 2026 GoodData Corporation

import { type AdCommandEnvelope } from "./hostBridge.js";

/** The mounted component that sends host commands. */
export type HostCommandOwner = object;

interface IQueuedHostCommand {
    envelope: AdCommandEnvelope;
    owner: HostCommandOwner;
}

// Commands an in-process host sends before AD listens for them. The root saga starts its command
// watchers only after async steps (the locale messages, the backend), so a command dispatched as
// soon as the sagas start would reach no watcher and be lost.
let isOpen = false;
let queued: IQueuedHostCommand[] = [];
// An owner is active while its component is mounted. React StrictMode unmounts and mounts the same
// component once in development, so an owner can become active again; its commands then survive.
const activeOwners = new WeakSet<HostCommandOwner>();

export function isHostCommandDeliveryOpen(): boolean {
    return isOpen;
}

export function activateHostCommandOwner(owner: HostCommandOwner): void {
    activeOwners.add(owner);
}

/**
 * Marks the component unmounted. Its queued commands stay until the delivery opens, which drops them
 * unless the same component mounted again in between.
 */
export function deactivateHostCommandOwner(owner: HostCommandOwner): void {
    activeOwners.delete(owner);
}

/** Keeps a command until AD listens for commands. */
export function queueHostCommand(envelope: AdCommandEnvelope, owner: HostCommandOwner): void {
    queued.push({ envelope, owner });
}

/**
 * Marks AD as listening for commands and returns the commands sent before it was by the components
 * that are still mounted. The commands of an unmounted component are dropped, so they never reach the
 * runtime of a later mount.
 */
export function openHostCommandDelivery(): AdCommandEnvelope[] {
    isOpen = true;
    const deliverable = queued.filter((command) => activeOwners.has(command.owner));
    queued = [];
    return deliverable.map((command) => command.envelope);
}

/** Marks AD as no longer listening; the commands sent from now on wait for the next open. */
export function closeHostCommandDelivery(): void {
    isOpen = false;
}
