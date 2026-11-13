// (C) 2026 GoodData Corporation

import {
    resetEventGate,
    resolveVisibleParentOrigin,
    startParentOriginResolution,
    stopParentOriginResolution,
} from "@gooddata/sdk-embedding/internal";

import { validateHostDomain } from "../sagas/command_received_saga.js";

/**
 * Options of {@link startParentOriginValidation}.
 *
 * @internal
 */
export interface IStartParentOriginValidationOptions {
    /**
     * Value of `enableEmbeddingOriginValidation`.
     */
    isOriginValidationEnabled: boolean;
    /**
     * True when AD is embedded in an iframe (`/embedded/` URL).
     */
    isIframeEmbedded: boolean;
    organizationId: string | undefined;
    /**
     * Origin of the first `setApiToken`, already validated by the host.
     */
    handshakeOrigin?: string;
}

/**
 * Decides how the outgoing window events go to the parent. Call it at mount, after the backend is
 * adopted and before the sagas start.
 *
 * With origin validation on, in a frame that has a parent, the events wait until the parent origin
 * is validated and then go to that origin only. In all other cases they go to `*`, as before. Events
 * for a host adapter (AD rendered in-process) do not go through the window, so the gate does not
 * apply to them.
 *
 * @internal
 */
export function startParentOriginValidation({
    isOriginValidationEnabled,
    isIframeEmbedded,
    organizationId,
    handshakeOrigin,
}: IStartParentOriginValidationOptions): void {
    // An embed link opened directly is "iframe" by its URL, but has no parent: it never holds.
    const hasParent = window.parent !== window;
    if (!isOriginValidationEnabled || !isIframeEmbedded || !hasParent) {
        resetEventGate();
        return;
    }
    startParentOriginResolution({
        // The Tiger endpoint takes the organization from the credentials, not from the id.
        validate: (origin) => validateHostDomain(organizationId ?? "", origin),
        visibleOrigin: resolveVisibleParentOrigin(),
        handshakeOrigin,
    });
}

/**
 * Stops the parent origin resolution at unmount.
 *
 * @internal
 */
export function stopParentOriginValidation(): void {
    stopParentOriginResolution();
}
