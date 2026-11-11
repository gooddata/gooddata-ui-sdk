// (C) 2026 GoodData Corporation

/**
 * A message that the shell routes between pluggable applications and headless modules.
 *
 * @remarks
 * The shell reads only `channel`. The module that owns the channel defines `type` and `payload` in its
 * own contract. `payload` must be structured-cloneable: the shell copies it before delivery.
 *
 * @alpha
 */
export interface IModuleMessage {
    /**
     * Name of the channel, by convention `"<owner>.<protocol>.v<major>"`. The shell matches it by exact,
     * case-sensitive equality.
     */
    readonly channel: string;
    /**
     * Kind of the message, defined by the channel contract.
     */
    readonly type: string;
    /**
     * Data of the message, defined by the channel contract.
     */
    readonly payload?: unknown;
}

/**
 * The application or the headless module that sent a module message.
 *
 * @alpha
 */
export interface IModuleMessageSender {
    readonly kind: "application" | "headless";
    /**
     * The registry id of the application or of the headless module.
     */
    readonly id: string;
}

/**
 * Reason why the shell could not complete a module message.
 *
 * @remarks
 * - `channel-not-found`: no module owns the channel after all headless modules mounted or failed.
 * - `timeout`: no reply in time.
 * - `aborted`: the caller aborted, or the sender unmounted.
 * - `recipient-unmounted`: the module that owns the channel unmounted before it replied.
 * - `handler-failed`: the channel handler threw or rejected.
 * - `invalid-message`: the envelope is wrong, the payload or the reply cannot be cloned, or a module
 *   sent a request to its own channel.
 *
 * @alpha
 */
export type ModuleMessagingErrorCode =
    | "channel-not-found"
    | "timeout"
    | "aborted"
    | "recipient-unmounted"
    | "handler-failed"
    | "invalid-message";

/**
 * Error that rejects a module message request.
 *
 * @alpha
 */
export interface IModuleMessagingError extends Error {
    readonly name: "ModuleMessagingError";
    readonly code: ModuleMessagingErrorCode;
    readonly channel: string;
}

const MODULE_MESSAGING_ERROR_CODES: ReadonlySet<string> = new Set<ModuleMessagingErrorCode>([
    "channel-not-found",
    "timeout",
    "aborted",
    "recipient-unmounted",
    "handler-failed",
    "invalid-message",
]);

/**
 * Creates an {@link IModuleMessagingError}.
 *
 * @alpha
 */
export function createModuleMessagingError(
    code: ModuleMessagingErrorCode,
    channel: string,
    message?: string,
): IModuleMessagingError {
    const error = new Error(message ?? `Module message on channel "${channel}" failed: ${code}.`);
    return Object.assign(error, { name: "ModuleMessagingError" as const, code, channel });
}

/**
 * Type guard checking whether the object is an {@link IModuleMessagingError}.
 *
 * @remarks
 * Checks the shape, not the prototype, because the shell and the caller can bundle different copies
 * of this package.
 *
 * @alpha
 */
export function isModuleMessagingError(obj: unknown): obj is IModuleMessagingError {
    if (!(obj instanceof Error)) {
        return false;
    }
    const candidate = obj as Partial<IModuleMessagingError>;
    return (
        candidate.name === "ModuleMessagingError" &&
        typeof candidate.code === "string" &&
        MODULE_MESSAGING_ERROR_CODES.has(candidate.code) &&
        typeof candidate.channel === "string"
    );
}

/**
 * Type guard checking whether the object has the envelope of an {@link IModuleMessage}.
 *
 * @remarks
 * Checks the envelope only. Validate `payload` with the guards of the channel contract.
 *
 * @alpha
 */
export function isModuleMessage(obj: unknown): obj is IModuleMessage {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const candidate = obj as Partial<IModuleMessage>;
    return (
        typeof candidate.channel === "string" &&
        candidate.channel.length > 0 &&
        typeof candidate.type === "string"
    );
}

const CHANNEL_NAME_CONVENTION = /^[a-z][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)+\.v[0-9]+$/;

/**
 * Checks whether a channel name follows the convention `"<owner>.<protocol>.v<major>"`.
 *
 * @remarks
 * The shell routes every non-empty name. It only warns about a name that breaks the convention.
 *
 * @alpha
 */
export function isConventionalModuleChannelName(channel: string): boolean {
    return CHANNEL_NAME_CONVENTION.test(channel);
}

/**
 * Options of {@link IModuleMessaging.request}.
 *
 * @alpha
 */
export interface IModuleRequestOptions {
    /**
     * Maximum time in milliseconds for the whole request: the wait for the headless modules and the
     * handler. The default is 10 000.
     */
    timeoutMs?: number;
    /**
     * Aborts the request. The handler signal is aborted too.
     */
    signal?: AbortSignal;
}

/**
 * Sends module messages to channels that headless modules own.
 *
 * @remarks
 * The shell gives one instance to each application mount and to each headless module mount. When the
 * mount ends, the shell aborts the pending requests of the instance.
 *
 * @alpha
 */
export interface IModuleMessaging {
    /**
     * Sends a request to the module that owns `message.channel` and resolves with its reply.
     *
     * @remarks
     * Rejects with an {@link IModuleMessagingError}. A request to a channel that no module owns yet waits
     * until all headless modules mounted or failed.
     */
    request(message: IModuleMessage, options?: IModuleRequestOptions): Promise<unknown>;
    /**
     * Sends a message with no reply. The shell logs a failure to the console.
     */
    notify(message: IModuleMessage): void;
    /**
     * Resolves with `true` when a module owns the channel, after all headless modules mounted or failed.
     * Resolves with `false` when the mount that owns this instance ends first.
     */
    hasChannel(channel: string): Promise<boolean>;
}

/**
 * Context that the shell gives to a {@link ModuleChannelHandler}.
 *
 * @alpha
 */
export interface IModuleChannelHandlerContext {
    readonly sender: IModuleMessageSender;
    /**
     * Aborted on timeout, on caller abort, and when the sender or the owner of the channel unmounts.
     */
    readonly signal: AbortSignal;
    /**
     * `true` for {@link IModuleMessaging.request}, `false` for {@link IModuleMessaging.notify}.
     */
    readonly expectsReply: boolean;
}

/**
 * Handler of a channel that a headless module owns. The return value is the reply.
 *
 * @remarks
 * The reply must be structured-cloneable. Throw to reject the request with `handler-failed`.
 *
 * @alpha
 */
export type ModuleChannelHandler = (
    message: IModuleMessage,
    context: IModuleChannelHandlerContext,
) => unknown;

/**
 * How the shell handled a message that a headless module posted to the active application.
 *
 * @remarks
 * - `delivered`: the shell delivers it to the application.
 * - `queued`: an application is mounting. The shell replays the message after the mount.
 * - `no-receiver`: no application is active, the application has no `onModuleMessage`, or the
 *   application does not accept the channel.
 * - `rejected`: the envelope or the payload is invalid, or the module does not own the channel.
 *
 * @alpha
 */
export type ModulePostResult = "delivered" | "queued" | "no-receiver" | "rejected";

/**
 * The application that receives module messages.
 *
 * @alpha
 */
export interface IActiveApplicationInfo {
    /**
     * The registry id of the application.
     */
    readonly id: string;
    /**
     * Channels the application accepts, most preferred first. `undefined` means every channel.
     */
    readonly acceptedChannels?: readonly string[];
}
