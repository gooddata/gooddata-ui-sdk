// (C) 2026 GoodData Corporation

import {
    type IActiveApplicationInfo,
    type IModuleMessage,
    type IModuleMessageSender,
    type IModuleMessaging,
    type IModuleMessagingError,
    type IModuleRequestOptions,
    type IPluggableApplicationMountHandle,
    type ModuleChannelHandler,
    type ModuleMessagingErrorCode,
    type ModulePostResult,
    createModuleMessagingError,
    isConventionalModuleChannelName,
    isModuleMessage,
} from "@gooddata/sdk-pluggable-application-model";

import { isThenable } from "../lib/isThenable.js";

import { type IMountMailbox, createMountMailbox } from "./mountMailbox.js";

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_TIMEOUT_MS = 2_147_483_647;
const MAILBOX_LIMIT = 100;
const LOG_PREFIX = "[host-runtime/messaging]";

// Message failures go to the console only. The lifecycle failure callbacks mean a failed load or mount.
export interface IModuleMessageBrokerDependencies {
    reportFailure: (target: IModuleMessageSender, message: string) => void;
    warn: (message: string) => void;
    clone: <T>(value: T) => T;
}

const defaultDependencies: IModuleMessageBrokerDependencies = {
    reportFailure: (target, message) =>
        console.error(`${LOG_PREFIX} ${target.kind} "${target.id}": ${message}`),
    warn: (message) => console.warn(`${LOG_PREFIX} ${message}`),
    clone: (value) => structuredClone(value),
};

export interface IHeadlessModuleMessagingPort {
    registerChannel(channel: string, handler: ModuleChannelHandler): () => void;
    postToActiveApplication(message: IModuleMessage): ModulePostResult;
    moduleMessaging: IModuleMessaging;
    setActiveApplicationListener(
        listener: ((app: IActiveApplicationInfo | undefined) => void) | undefined,
    ): void;
    close(): void;
}

export type ModuleMessageReceiver = Pick<
    IPluggableApplicationMountHandle,
    "onModuleMessage" | "acceptedChannels"
>;

export interface IApplicationMessagingAttachment {
    messaging: IModuleMessaging;
    ready(receiver: ModuleMessageReceiver | undefined): void;
    detach(): void;
}

interface IChannelOwner {
    moduleId: string;
    handler: ModuleChannelHandler;
}

interface IInflightRequest {
    channel: string;
    ownerModuleId?: string;
    finish(error?: IModuleMessagingError, reply?: unknown): void;
}

interface IEndpoint {
    sender: IModuleMessageSender;
    closed: boolean;
    inflight: Set<IInflightRequest>;
}

interface IQueuedModuleMessage {
    message: IModuleMessage;
    sender: IModuleMessageSender;
}

interface IAttachmentState {
    appId: string;
    endpoint: IEndpoint;
    mailbox: IMountMailbox<IQueuedModuleMessage>;
    receiver?: ModuleMessageReceiver;
    info?: IActiveApplicationInfo;
    detached: boolean;
}

function channelOf(message: unknown): string {
    const channel = (message as { channel?: unknown } | null)?.channel;
    return typeof channel === "string" ? channel : "";
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function resolveTimeout(timeoutMs: number | undefined): number {
    if (typeof timeoutMs !== "number" || Number.isNaN(timeoutMs) || timeoutMs <= 0) {
        return DEFAULT_TIMEOUT_MS;
    }
    return Math.min(timeoutMs, MAX_TIMEOUT_MS);
}

function rejected(code: ModuleMessagingErrorCode, channel: string, message?: string): Promise<never> {
    return Promise.reject(createModuleMessagingError(code, channel, message));
}

function acceptsChannel(info: IActiveApplicationInfo | undefined, channel: string): boolean {
    return !info?.acceptedChannels || info.acceptedChannels.includes(channel);
}

function readAcceptedChannels(receiver: ModuleMessageReceiver | undefined): readonly string[] | undefined {
    const accepted: unknown = receiver?.acceptedChannels;
    if (!Array.isArray(accepted)) {
        return undefined;
    }
    return Object.freeze(accepted.filter((channel): channel is string => typeof channel === "string"));
}

/**
 * Routes module messages by channel name between applications and headless modules.
 *
 * @remarks
 * The broker reads only the `channel` of a message. One broker serves one page and principal.
 */
export class ModuleMessageBroker {
    private readonly deps: IModuleMessageBrokerDependencies;
    private readonly channels = new Map<string, IChannelOwner>();
    private readonly listeners = new Map<string, (app: IActiveApplicationInfo | undefined) => void>();
    private readonly endpoints = new Set<IEndpoint>();
    private readonly inflight = new Set<IInflightRequest>();
    private readonly deliveryChains = new Map<string, Promise<void>>();
    private readonly warnedChannels = new Set<string>();
    private readonly channelWaiters = new Map<string, Set<() => void>>();
    private readonly settled: Promise<void>;
    private resolveSettled: () => void = () => undefined;
    private isSettled = false;
    private disposed = false;
    private attachment: IAttachmentState | undefined;

    constructor(deps: Partial<IModuleMessageBrokerDependencies> = {}) {
        this.deps = { ...defaultDependencies, ...deps };
        this.settled = new Promise((resolve) => {
            this.resolveSettled = resolve;
        });
    }

    public markSettled(): void {
        this.isSettled = true;
        this.resolveSettled();
    }

    public dispose(): void {
        if (this.disposed) {
            return;
        }
        this.disposed = true;
        if (this.attachment) {
            this.detach(this.attachment);
        }
        [...this.endpoints].forEach((endpoint) => this.closeEndpoint(endpoint));
        [...this.inflight].forEach((request) =>
            request.finish(createModuleMessagingError("aborted", request.channel)),
        );
        this.channels.clear();
        this.channelWaiters.clear();
        this.listeners.clear();
        this.markSettled();
    }

    public connectHeadlessModule(moduleId: string): IHeadlessModuleMessagingPort {
        const endpoint = this.createEndpoint({ kind: "headless", id: moduleId });
        return {
            registerChannel: (channel, handler) => this.registerChannel(endpoint, channel, handler),
            postToActiveApplication: (message) => this.postToActiveApplication(endpoint, message),
            moduleMessaging: this.createMessaging(endpoint),
            setActiveApplicationListener: (listener) => this.setListener(endpoint, listener),
            close: () => {
                this.closeEndpoint(endpoint);
                this.unregisterModule(moduleId);
            },
        };
    }

    public attachApplication(appId: string): IApplicationMessagingAttachment {
        if (this.attachment) {
            this.detach(this.attachment);
        }
        const endpoint = this.createEndpoint({ kind: "application", id: appId });
        const state: IAttachmentState = {
            appId,
            endpoint,
            detached: false,
            mailbox: createMountMailbox<IQueuedModuleMessage>({
                limit: MAILBOX_LIMIT,
                onOverflow: () =>
                    this.deps.warn(`Dropped the oldest module message queued for application "${appId}".`),
                onDeliveryError: (error) =>
                    this.deps.reportFailure(endpoint.sender, `onModuleMessage threw: ${errorMessage(error)}`),
            }),
        };
        if (this.disposed) {
            state.detached = true;
            state.mailbox.close();
            this.closeEndpoint(endpoint);
        } else {
            this.attachment = state;
        }
        return {
            messaging: this.createMessaging(endpoint),
            ready: (receiver) => this.ready(state, receiver),
            detach: () => this.detach(state),
        };
    }

    private createEndpoint(sender: IModuleMessageSender): IEndpoint {
        const endpoint: IEndpoint = {
            sender: Object.freeze({ kind: sender.kind, id: sender.id }),
            closed: this.disposed,
            inflight: new Set(),
        };
        if (!this.disposed) {
            this.endpoints.add(endpoint);
        }
        return endpoint;
    }

    private closeEndpoint(endpoint: IEndpoint): void {
        endpoint.closed = true;
        this.endpoints.delete(endpoint);
        [...endpoint.inflight].forEach((request) =>
            request.finish(createModuleMessagingError("aborted", request.channel)),
        );
    }

    private createMessaging(endpoint: IEndpoint): IModuleMessaging {
        return {
            request: (message, options) => this.send(endpoint, message, true, options),
            notify: (message) => {
                this.send(endpoint, message, false).catch((error: unknown) =>
                    this.deps.warn(
                        `Notification from ${endpoint.sender.kind} "${endpoint.sender.id}" failed: ${errorMessage(error)}`,
                    ),
                );
            },
            hasChannel: (channel) => this.hasChannel(endpoint, channel),
        };
    }

    private warnConvention(channel: string, sender: IModuleMessageSender): void {
        if (isConventionalModuleChannelName(channel) || this.warnedChannels.has(channel)) {
            return;
        }
        this.warnedChannels.add(channel);
        this.deps.warn(
            `Channel "${channel}" used by ${sender.kind} "${sender.id}" does not follow the ` +
                `"<owner>.<protocol>.v<major>" convention.`,
        );
    }

    private registerChannel(endpoint: IEndpoint, channel: string, handler: ModuleChannelHandler): () => void {
        if (typeof channel !== "string" || channel.length === 0 || typeof handler !== "function") {
            throw createModuleMessagingError("invalid-message", channelOf({ channel }));
        }
        if (endpoint.closed) {
            return () => undefined;
        }
        const existing = this.channels.get(channel);
        if (existing) {
            throw createModuleMessagingError(
                "invalid-message",
                channel,
                `Channel "${channel}" is already owned by headless module "${existing.moduleId}".`,
            );
        }
        this.warnConvention(channel, endpoint.sender);
        const owner: IChannelOwner = { moduleId: endpoint.sender.id, handler };
        this.channels.set(channel, owner);
        const waiters = this.channelWaiters.get(channel);
        this.channelWaiters.delete(channel);
        waiters?.forEach((wake) => wake());
        return () => {
            if (this.channels.get(channel) === owner) {
                this.channels.delete(channel);
                this.failInflight(
                    (request) => request.channel === channel && request.ownerModuleId === owner.moduleId,
                );
            }
        };
    }

    private unregisterModule(moduleId: string): void {
        for (const [channel, owner] of this.channels) {
            if (owner.moduleId === moduleId) {
                this.channels.delete(channel);
            }
        }
        this.failInflight((request) => request.ownerModuleId === moduleId);
        this.listeners.delete(moduleId);
    }

    private failInflight(match: (request: IInflightRequest) => boolean): void {
        [...this.inflight]
            .filter(match)
            .forEach((request) =>
                request.finish(createModuleMessagingError("recipient-unmounted", request.channel)),
            );
    }

    private send(
        endpoint: IEndpoint,
        message: IModuleMessage,
        expectsReply: boolean,
        options: IModuleRequestOptions = {},
    ): Promise<unknown> {
        if (!isModuleMessage(message)) {
            return rejected("invalid-message", channelOf(message));
        }
        const { channel } = message;
        this.warnConvention(channel, endpoint.sender);
        if (endpoint.closed || options.signal?.aborted) {
            return rejected("aborted", channel);
        }
        let copy: IModuleMessage;
        try {
            copy = this.deps.clone(message);
        } catch (error) {
            return rejected("invalid-message", channel, `Cannot clone the message: ${errorMessage(error)}`);
        }
        const timeoutMs = resolveTimeout(options.timeoutMs);

        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            let done = false;
            let markDone: () => void = () => undefined;
            const finished = new Promise<void>((resolveFinished) => {
                markDone = resolveFinished;
            });
            const onAbort = () => request.finish(createModuleMessagingError("aborted", channel));
            const request: IInflightRequest = {
                channel,
                finish: (error, reply) => {
                    if (done) {
                        return;
                    }
                    done = true;
                    markDone();
                    clearTimeout(timer);
                    options.signal?.removeEventListener("abort", onAbort);
                    endpoint.inflight.delete(request);
                    this.inflight.delete(request);
                    if (error) {
                        controller.abort(error);
                        reject(error);
                    } else {
                        resolve(reply);
                    }
                },
            };
            const timer = setTimeout(
                () => request.finish(createModuleMessagingError("timeout", channel)),
                timeoutMs,
            );
            options.signal?.addEventListener("abort", onAbort);
            endpoint.inflight.add(request);
            this.inflight.add(request);

            this.enqueueDelivery(
                `${endpoint.sender.kind}:${endpoint.sender.id}\u0000${channel}`,
                async () => {
                    // A finished request must release the chain, or it blocks later requests until settle.
                    if (!this.channels.has(channel) && !this.isSettled) {
                        const waiter = this.waitForChannel(channel);
                        await Promise.race([this.settled, finished, waiter.registered]);
                        waiter.cancel();
                    }
                    if (done) {
                        return;
                    }
                    const owner = this.channels.get(channel);
                    if (!owner) {
                        request.finish(createModuleMessagingError("channel-not-found", channel));
                        return;
                    }
                    if (endpoint.sender.kind === "headless" && owner.moduleId === endpoint.sender.id) {
                        request.finish(
                            createModuleMessagingError(
                                "invalid-message",
                                channel,
                                `Headless module "${owner.moduleId}" sent a request to its own channel "${channel}".`,
                            ),
                        );
                        return;
                    }
                    request.ownerModuleId = owner.moduleId;
                    this.invokeHandler(
                        owner,
                        copy,
                        endpoint.sender,
                        controller.signal,
                        expectsReply,
                        request,
                    );
                },
            );
        });
    }

    // Delivery is serialized per sender and channel, so that a request waiting for the modules to
    // settle is not overtaken by a later request to the same channel.
    private enqueueDelivery(key: string, step: () => Promise<void>): void {
        const previous = this.deliveryChains.get(key) ?? Promise.resolve();
        const next = previous.then(step).catch((error: unknown) => this.deps.warn(errorMessage(error)));
        this.deliveryChains.set(key, next);
        void next.then(() => {
            if (this.deliveryChains.get(key) === next) {
                this.deliveryChains.delete(key);
            }
        });
    }

    private invokeHandler(
        owner: IChannelOwner,
        message: IModuleMessage,
        sender: IModuleMessageSender,
        signal: AbortSignal,
        expectsReply: boolean,
        request: IInflightRequest,
    ): void {
        // A throwing handler is the documented way to reject a request, so it is not a module failure.
        const fail = (error: unknown) =>
            request.finish(
                createModuleMessagingError("handler-failed", message.channel, errorMessage(error)),
            );
        let result: unknown;
        try {
            result = owner.handler(message, { sender, signal, expectsReply });
        } catch (error) {
            fail(error);
            return;
        }
        Promise.resolve(result).then((reply) => {
            if (!expectsReply) {
                request.finish();
                return;
            }
            try {
                request.finish(undefined, this.deps.clone(reply));
            } catch (error) {
                request.finish(
                    createModuleMessagingError(
                        "invalid-message",
                        message.channel,
                        `Cannot clone the reply: ${errorMessage(error)}`,
                    ),
                );
            }
        }, fail);
    }

    private hasChannel(endpoint: IEndpoint, channel: string): Promise<boolean> {
        if (endpoint.closed) {
            return Promise.resolve(false);
        }
        if (this.channels.has(channel) || this.isSettled) {
            return Promise.resolve(this.channels.has(channel));
        }
        return new Promise((resolve) => {
            let done = false;
            const waiter = this.waitForChannel(channel);
            const request: IInflightRequest = {
                channel,
                finish: () => {
                    if (done) {
                        return;
                    }
                    done = true;
                    waiter.cancel();
                    endpoint.inflight.delete(request);
                    resolve(!endpoint.closed && this.channels.has(channel));
                },
            };
            endpoint.inflight.add(request);
            void Promise.race([this.settled, waiter.registered]).then(() => request.finish());
        });
    }

    private waitForChannel(channel: string): { registered: Promise<void>; cancel: () => void } {
        let wake: () => void = () => undefined;
        const registered = new Promise<void>((resolve) => {
            wake = resolve;
        });
        const waiters = this.channelWaiters.get(channel) ?? new Set<() => void>();
        waiters.add(wake);
        this.channelWaiters.set(channel, waiters);
        return {
            registered,
            cancel: () => {
                const current = this.channelWaiters.get(channel);
                current?.delete(wake);
                if (current?.size === 0) {
                    this.channelWaiters.delete(channel);
                }
            },
        };
    }

    private postToActiveApplication(endpoint: IEndpoint, message: IModuleMessage): ModulePostResult {
        if (endpoint.closed || !isModuleMessage(message)) {
            return "rejected";
        }
        const { channel } = message;
        if (this.channels.get(channel)?.moduleId !== endpoint.sender.id) {
            this.deps.warn(
                `Headless module "${endpoint.sender.id}" posted on channel "${channel}" that it does not own.`,
            );
            return "rejected";
        }
        let copy: IModuleMessage;
        try {
            copy = this.deps.clone(message);
        } catch {
            return "rejected";
        }
        const state = this.attachment;
        if (!state || state.detached) {
            return "no-receiver";
        }
        if (state.info && (!state.receiver?.onModuleMessage || !acceptsChannel(state.info, channel))) {
            return "no-receiver";
        }
        const item: IQueuedModuleMessage = { message: copy, sender: endpoint.sender };
        if (!state.info) {
            return state.mailbox.push(item) === "queued" ? "queued" : "no-receiver";
        }
        queueMicrotask(() => state.mailbox.push(item));
        return "delivered";
    }

    private ready(state: IAttachmentState, receiver: ModuleMessageReceiver | undefined): void {
        if (state.detached || state.info) {
            return;
        }
        state.receiver = receiver;
        const info: IActiveApplicationInfo = Object.freeze({
            id: state.appId,
            acceptedChannels: readAcceptedChannels(receiver),
        });
        state.info = info;
        state.mailbox.open(({ message, sender }) => {
            return acceptsChannel(info, message.channel)
                ? receiver?.onModuleMessage?.(message, sender)
                : undefined;
        });
        if (!state.detached) {
            this.listeners.forEach((listener, moduleId) => this.callListener(moduleId, listener, info));
        }
    }

    private detach(state: IAttachmentState): void {
        if (state.detached) {
            return;
        }
        state.detached = true;
        state.mailbox.close();
        this.closeEndpoint(state.endpoint);
        if (this.attachment === state) {
            this.attachment = undefined;
        }
        if (state.info) {
            this.listeners.forEach((listener, moduleId) => this.callListener(moduleId, listener, undefined));
        }
    }

    private setListener(
        endpoint: IEndpoint,
        listener: ((app: IActiveApplicationInfo | undefined) => void) | undefined,
    ): void {
        const moduleId = endpoint.sender.id;
        if (!listener || endpoint.closed) {
            this.listeners.delete(moduleId);
            return;
        }
        this.listeners.set(moduleId, listener);
        const state = this.attachment;
        if (state?.info && !state.detached) {
            const info = state.info;
            queueMicrotask(() => {
                if (
                    this.attachment === state &&
                    !state.detached &&
                    this.listeners.get(moduleId) === listener
                ) {
                    this.callListener(moduleId, listener, info);
                }
            });
        }
    }

    private callListener(
        moduleId: string,
        listener: (app: IActiveApplicationInfo | undefined) => void,
        info: IActiveApplicationInfo | undefined,
    ): void {
        try {
            const result: unknown = listener(info);
            if (isThenable(result)) {
                result.then(undefined, (error: unknown) =>
                    this.deps.reportFailure(
                        { kind: "headless", id: moduleId },
                        `onActiveApplicationChanged rejected: ${errorMessage(error)}`,
                    ),
                );
            }
        } catch (error) {
            this.deps.reportFailure(
                { kind: "headless", id: moduleId },
                `onActiveApplicationChanged threw: ${errorMessage(error)}`,
            );
        }
    }
}
