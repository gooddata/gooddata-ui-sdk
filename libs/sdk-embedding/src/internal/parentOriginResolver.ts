// (C) 2026 GoodData Corporation

import { denyEvents, holdEvents, openEvents, setEventHeldListener } from "./originGate.js";

/**
 * Returns the origin of the parent window as the browser shows it, or `undefined` when the parent
 * hides it.
 *
 * @remarks
 * It reads `location.ancestorOrigins` (not in Firefox), then `document.referrer`. A referrer equal to
 * the own origin is ignored when the parent is not same-origin: a redirect inside the frame, for
 * example a login, sets the referrer to the own origin.
 *
 * @internal
 */
export function resolveVisibleParentOrigin(win: Window = window): string | undefined {
    const ancestorOrigin = win.location.ancestorOrigins?.[0];
    if (ancestorOrigin && ancestorOrigin !== "null") {
        return ancestorOrigin;
    }

    const referrer = win.document.referrer;
    if (!referrer) {
        return undefined;
    }

    let referrerOrigin: string;
    try {
        referrerOrigin = new URL(referrer).origin;
    } catch {
        return undefined;
    }
    if (referrerOrigin === "null") {
        return undefined;
    }
    if (referrerOrigin === win.location.origin && !isParentSameOrigin(win)) {
        return undefined;
    }
    return referrerOrigin;
}

function isParentSameOrigin(win: Window): boolean {
    try {
        return win.parent !== win && win.parent.location.origin === win.location.origin;
    } catch {
        return false;
    }
}

/**
 * Options of {@link createParentOriginResolver}.
 *
 * @internal
 */
export interface IParentOriginResolverOptions {
    /**
     * Asks the backend if the origin is in the embedding origins of the organization. Resolves
     * `false` only for a "not valid" answer and rejects on every error.
     */
    validate: (origin: string) => Promise<boolean>;
    /**
     * Origin of the parent as the browser shows it, see {@link resolveVisibleParentOrigin}.
     */
    visibleOrigin?: string;
    /**
     * Origin of the first `setApiToken`, already validated by the host.
     */
    handshakeOrigin?: string;
    /**
     * Minimum time between two validations after an error. Default 5 seconds.
     */
    retryIntervalMs?: number;
    /**
     * Current time in milliseconds, for tests.
     */
    now?: () => number;
}

/**
 * Finds the parent origin that the outgoing events go to, and opens or denies the event gate.
 *
 * @internal
 */
export interface IParentOriginResolver {
    /**
     * Tells the resolver that an incoming command came from a validated origin.
     */
    onValidatedCommandOrigin(origin: string): void;
    /**
     * Stops the resolver. It does not change the gate.
     */
    dispose(): void;
}

type ResolverPhase = "validating" | "retryPending" | "awaitingCommand" | "done";

/**
 * Starts to find the parent origin. It expects the gate to hold the events.
 *
 * @remarks
 * The order:
 * 1. The handshake origin: the host has validated it, so the gate opens with no call.
 * 2. The visible origin: validated; the gate opens to it, or is denied.
 * 3. Else `*` is validated. If `*` is not valid, the first incoming command with a valid origin
 *    opens the gate to that origin, also when the command came before the `*` answer.
 *
 * An error is not an answer: the gate keeps holding, and the resolver tries again when an event is
 * held or a validated command comes, at most once per `retryIntervalMs`.
 *
 * @internal
 */
export function createParentOriginResolver(options: IParentOriginResolverOptions): IParentOriginResolver {
    const { validate, visibleOrigin, handshakeOrigin, retryIntervalMs = 5000, now = Date.now } = options;
    const candidate = visibleOrigin ?? "*";

    let phase: ResolverPhase = "validating";
    let lastAttempt = 0;
    let disposed = false;
    // First validated command origin that came while `*` was not yet answered.
    let earlyCommandOrigin: string | undefined;

    const finish = () => {
        phase = "done";
        setEventHeldListener(undefined);
    };

    const attempt = () => {
        phase = "validating";
        lastAttempt = now();
        validate(candidate).then(
            (isValid) => {
                if (disposed) {
                    return;
                }
                if (isValid) {
                    openEvents(candidate);
                    finish();
                } else if (visibleOrigin === undefined) {
                    if (earlyCommandOrigin) {
                        openEvents(earlyCommandOrigin);
                        finish();
                    } else {
                        phase = "awaitingCommand";
                    }
                } else {
                    denyEvents();
                    finish();
                }
            },
            (error: unknown) => {
                if (disposed) {
                    return;
                }
                const { name, httpStatus } = (error ?? {}) as { name?: string; httpStatus?: number };
                console.warn(`Embedding: the validation of the parent origin "${candidate}" failed.`, {
                    name,
                    httpStatus,
                });
                phase = "retryPending";
            },
        );
    };

    const retryIfDue = () => {
        if (phase === "retryPending" && now() - lastAttempt >= retryIntervalMs) {
            attempt();
        }
    };

    if (handshakeOrigin) {
        openEvents(handshakeOrigin);
        finish();
    } else {
        setEventHeldListener(retryIfDue);
        attempt();
    }

    return {
        onValidatedCommandOrigin: (origin: string) => {
            if (disposed) {
                return;
            }
            if (phase === "awaitingCommand") {
                openEvents(origin);
                finish();
                return;
            }
            if (visibleOrigin === undefined && phase !== "done") {
                earlyCommandOrigin ??= origin;
            }
            retryIfDue();
        },
        dispose: () => {
            disposed = true;
            if (phase !== "done") {
                setEventHeldListener(undefined);
            }
        },
    };
}

let activeResolver: IParentOriginResolver | undefined;

/**
 * Holds the outgoing events and starts to find the parent origin. A module calls it at mount, before
 * it posts the first event, when origin validation is on and the frame has a parent.
 *
 * @internal
 */
export function startParentOriginResolution(options: IParentOriginResolverOptions): void {
    activeResolver?.dispose();
    holdEvents();
    activeResolver = createParentOriginResolver(options);
}

/**
 * Tells the active resolver that an incoming command came from a validated origin. It has no effect
 * when no resolution runs.
 *
 * @internal
 */
export function notifyValidatedCommandOrigin(origin: string): void {
    activeResolver?.onValidatedCommandOrigin(origin);
}

/**
 * Stops the active resolution, if any. The gate keeps its state, so that events posted during an
 * unmount do not go to `*`.
 *
 * @internal
 */
export function stopParentOriginResolution(): void {
    activeResolver?.dispose();
    activeResolver = undefined;
}
