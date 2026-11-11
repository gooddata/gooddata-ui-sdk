// (C) 2026 GoodData Corporation

import { isThenable } from "../lib/isThenable.js";

export type MountMailboxPushResult = "queued" | "delivered" | "closed";

export interface IMountMailbox<T> {
    push(item: T): MountMailboxPushResult;
    /**
     * Replays the queued items in order, then delivers every later item at once.
     */
    open(deliver: (item: T) => unknown): void;
    close(): void;
    readonly isClosed: boolean;
}

export interface IMountMailboxOptions {
    limit?: number;
    onOverflow?: () => void;
    onDeliveryError?: (error: unknown) => void;
}

export function createMountMailbox<T>(options: IMountMailboxOptions = {}): IMountMailbox<T> {
    const { limit = Number.POSITIVE_INFINITY, onOverflow, onDeliveryError } = options;
    let queue: T[] = [];
    let deliverItem: ((item: T) => unknown) | undefined;
    let replaying = false;
    let closed = false;

    const safeDeliver = (deliver: (item: T) => unknown, item: T) => {
        try {
            const result = deliver(item);
            if (isThenable(result)) {
                result.then(undefined, (error: unknown) => onDeliveryError?.(error));
            }
        } catch (error) {
            onDeliveryError?.(error);
        }
    };

    return {
        get isClosed() {
            return closed;
        },
        push(item) {
            if (closed) {
                return "closed";
            }
            // Keep queueing during replay, so a reentrant push cannot overtake older items.
            if (!deliverItem || replaying) {
                if (queue.length >= limit) {
                    queue.shift();
                    onOverflow?.();
                }
                queue.push(item);
                return "queued";
            }
            safeDeliver(deliverItem, item);
            return "delivered";
        },
        open(deliver) {
            if (closed || deliverItem) {
                return;
            }
            deliverItem = deliver;
            replaying = true;
            while (queue.length && !closed) {
                safeDeliver(deliver, queue.shift() as T);
            }
            replaying = false;
            queue = [];
        },
        close() {
            closed = true;
            deliverItem = undefined;
            queue = [];
        },
    };
}
