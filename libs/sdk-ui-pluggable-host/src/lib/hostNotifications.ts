// (C) 2026 GoodData Corporation

import { type IHostUiMountHandle, type IHostUiNotification } from "@gooddata/sdk-pluggable-application-model";

//
// Routes runtime-detected notifications (e.g. a new deployment was published) to whichever
// host UI module is currently mounted. Notifications dispatched before any UI is mounted
// are queued and replayed once the UI registers itself, so the user is never silently dropped
// because of a timing race between the host's detection and the UI mount.
//

// Bounds the buffer for pre-mount dispatches. In practice we expect at most one
// notification before the UI mounts (the new-deployment toast), so this only matters
// as defence against a misbehaving caller that loops.
const MAX_QUEUE_SIZE = 16;

let activeHandle: IHostUiMountHandle | undefined;
const queue: IHostUiNotification[] = [];

/**
 * Dispatches a notification into the currently mounted host UI module.
 *
 * @remarks
 * If no UI is mounted yet (e.g. the host bootstrap is still in progress) the notification
 * is queued and replayed when the host UI handle registers. The queue is capped at a small
 * bounded size; oldest entries are dropped on overflow.
 *
 * @alpha
 */
export function dispatchHostNotification(notification: IHostUiNotification): void {
    if (activeHandle?.notify) {
        activeHandle.notify(notification);
        return;
    }
    if (queue.length >= MAX_QUEUE_SIZE) {
        queue.shift();
    }
    queue.push(notification);
}

/**
 * Registers (or clears) the host UI mount handle that should receive notifications.
 *
 * @remarks
 * Called by {@link HostUiContainer} after a successful mount and again with `undefined`
 * on unmount. On register, any queued notifications are flushed in arrival order.
 */
export function setActiveHostHandle(handle: IHostUiMountHandle | undefined): void {
    activeHandle = handle;
    if (!handle?.notify || queue.length === 0) {
        return;
    }
    const drained = queue.splice(0, queue.length);
    for (const notification of drained) {
        handle.notify(notification);
    }
}
