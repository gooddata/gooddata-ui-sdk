// (C) 2025-2026 GoodData Corporation

import type { IKdaDefinition } from "../types.js";

type OwnerId = string;

type OpenRequestListener = (definition: IKdaDefinition) => void;

/**
 * Lightweight in-memory arbiter to prevent multiple {@link KdaDialogController} instances from opening at once.
 *
 * @remarks
 * This is an internal short-term mitigation. Ideal solution is a single host.
 */
export class KdaDialogArbiter {
    private static instance: KdaDialogArbiter | undefined;

    static getInstance(): KdaDialogArbiter {
        if (!KdaDialogArbiter.instance) {
            KdaDialogArbiter.instance = new KdaDialogArbiter();
        }
        return KdaDialogArbiter.instance;
    }

    private activeOwnerId: OwnerId | null = null;
    private openRequestListeners = new Map<OwnerId, OpenRequestListener>();

    private constructor() {}

    registerOwner(ownerId: OwnerId, onOpenRequested: OpenRequestListener): () => void {
        this.openRequestListeners.set(ownerId, onOpenRequested);
        return () => {
            this.openRequestListeners.delete(ownerId);
            this.release(ownerId);
        };
    }

    tryAcquire(ownerId: OwnerId): boolean {
        if (this.activeOwnerId === null || this.activeOwnerId === ownerId) {
            this.activeOwnerId = ownerId;
            return true;
        }
        return false;
    }

    requestOpen(ownerId: OwnerId, definition: IKdaDefinition): boolean {
        if (this.tryAcquire(ownerId)) {
            return true;
        }

        const activeOwnerId = this.activeOwnerId;
        if (!activeOwnerId) {
            return false;
        }

        this.openRequestListeners.get(activeOwnerId)?.(definition);
        return false;
    }

    release(ownerId: OwnerId): void {
        if (this.activeOwnerId === ownerId) {
            this.activeOwnerId = null;
        }
    }
}
