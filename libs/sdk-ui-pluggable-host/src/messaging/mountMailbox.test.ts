// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { createMountMailbox } from "./mountMailbox.js";

describe("createMountMailbox", () => {
    it("queues items until open, then replays them in order and delivers later items at once", () => {
        const mailbox = createMountMailbox<number>();
        const deliver = vi.fn();

        expect(mailbox.push(1)).toBe("queued");
        expect(mailbox.push(2)).toBe("queued");
        mailbox.open(deliver);
        expect(mailbox.push(3)).toBe("delivered");

        expect(deliver.mock.calls).toEqual([[1], [2], [3]]);
    });

    it("keeps reentrant pushes behind older items during replay", () => {
        const mailbox = createMountMailbox<number>();
        const delivered: number[] = [];
        mailbox.push(1);
        mailbox.push(2);

        mailbox.open((item) => {
            delivered.push(item);
            if (item === 1) {
                expect(mailbox.push(3)).toBe("queued");
            }
        });

        expect(delivered).toEqual([1, 2, 3]);
    });

    it("drops queued items on close and refuses later pushes", () => {
        const mailbox = createMountMailbox<number>();
        const deliver = vi.fn();
        mailbox.push(1);

        mailbox.close();
        mailbox.open(deliver);

        expect(mailbox.push(2)).toBe("closed");
        expect(mailbox.isClosed).toBe(true);
        expect(deliver).not.toHaveBeenCalled();
    });

    it("stops the replay when a delivery closes the mailbox", () => {
        const mailbox = createMountMailbox<number>();
        const delivered: number[] = [];
        mailbox.push(1);
        mailbox.push(2);

        mailbox.open((item) => {
            delivered.push(item);
            mailbox.close();
        });

        expect(delivered).toEqual([1]);
    });

    it("drops the oldest item when the queue is full", () => {
        const onOverflow = vi.fn();
        const mailbox = createMountMailbox<number>({ limit: 2, onOverflow });
        const deliver = vi.fn();

        mailbox.push(1);
        mailbox.push(2);
        mailbox.push(3);
        mailbox.open(deliver);

        expect(onOverflow).toHaveBeenCalledTimes(1);
        expect(deliver.mock.calls).toEqual([[2], [3]]);
    });

    it("reports a delivery that returns a rejected promise", async () => {
        const onDeliveryError = vi.fn();
        const mailbox = createMountMailbox<number>({ onDeliveryError });
        const failure = new Error("async boom");

        mailbox.open(() => Promise.reject(failure));
        mailbox.push(1);
        await Promise.resolve();

        expect(onDeliveryError).toHaveBeenCalledWith(failure);
    });

    it("reports a failing delivery and continues with the next item", () => {
        const onDeliveryError = vi.fn();
        const mailbox = createMountMailbox<number>({ onDeliveryError });
        const delivered: number[] = [];
        const failure = new Error("boom");
        mailbox.push(1);
        mailbox.push(2);

        mailbox.open((item) => {
            if (item === 1) {
                throw failure;
            }
            delivered.push(item);
        });

        expect(onDeliveryError).toHaveBeenCalledWith(failure);
        expect(delivered).toEqual([2]);
    });
});
