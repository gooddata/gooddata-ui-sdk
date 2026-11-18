// (C) 2026 GoodData Corporation

import { type EventSourceMessage, EventSourceParserStream } from "eventsource-parser/stream";

import {
    ExecutionAPI_StreamExecutionProgress,
    ExecutionResultAPI_RetrieveExecutionMetadata,
} from "@gooddata/api-client-tiger/endpoints/execution";
import { type IExecutionResult } from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

/**
 * Type of one execution progress event, as emitted by the execution progress endpoint.
 *
 * @alpha
 */
export type ExecutionProgressEventType =
    | "STARTED"
    | "PREPROCESSING_STARTED"
    | "SQL_GENERATION_STARTED"
    | "SQL_GENERATION_FINISHED"
    | "CHILDREN_REQUESTED"
    | "FEATURES_DETERMINED"
    | "DATABASE_QUERY_REQUESTED"
    | "DATABASE_QUERY_STARTED"
    | "DATABASE_QUERY_RESULT_STREAMING_STARTED"
    | "POSTPROCESSING_STARTED"
    | "CACHE_HIT"
    | "FINISHED";

/**
 * Child computation requested by a parent computation (CHILDREN_REQUESTED).
 *
 * @alpha
 */
export interface IExecutionProgressChild {
    resultId: string;
    role?: string | null;
    dataSourceId?: string | null;
    /** the data source's display name, when the backend could resolve it */
    dataSourceName?: string | null;
}

/**
 * How one raw computation of a cached result queried its data source originally.
 *
 * @remarks
 * Unknown or unavailable fields are omitted (or null).
 *
 * @alpha
 */
export interface IComputationProfileSource {
    resultId?: string | null;
    dataSourceId?: string | null;
    /** the data source's display name, when the backend could resolve it */
    dataSourceName?: string | null;
    queryRequestedAt?: number | null;
    queryStartedAt?: number | null;
    streamingStartedAt?: number | null;
    finishedAt?: number | null;
    /** query start → result streaming start */
    dbDurationMs?: number | null;
    /** when the result cache saw the query finish (the child computation finished) */
    queryFinishedAt?: number | null;
    /**
     * The overall querying as the result cache saw it: query requested → finished, the same span
     * as the "Querying" step of a fresh load. Absent for results cached before it was recorded.
     */
    queryDurationMs?: number | null;
    /** query start → finish */
    totalDurationMs?: number | null;
    rows?: number | null;
}

/**
 * How a cached result was originally computed, stored together with the cached data.
 *
 * @alpha
 */
export interface IComputationProfile {
    v?: number;
    /** epoch ms when the cached result was written */
    computedAt?: number | null;
    /** epoch ms the original root computation started */
    startedAt?: number | null;
    /** epoch ms the original root computation's result was complete */
    finishedAt?: number | null;
    /** the original root computation end to end: `finishedAt - startedAt` */
    totalDurationMs?: number | null;
    /** set when `finishedAt` is approximated, names the milestone used (e.g. `postprocessingStarted`) */
    finishedAtApprox?: string | null;
    sources?: IComputationProfileSource[] | null;
}

/**
 * One step of a running execution (one computation, identified by its resultId).
 *
 * @remarks
 * The generated client types the stream as untyped objects. Absent fields may be either omitted or
 * null.
 *
 * @alpha
 */
export interface IExecutionProgressEvent {
    seq: number;
    executionId: string;
    resultId: string;
    parentResultId?: string | null;
    type: ExecutionProgressEventType;
    timestamp: number;
    role?: string | null;
    dataSourceId?: string | null;
    /** the data source's display name, when the backend could resolve it */
    dataSourceName?: string | null;
    postprocessingType?: string | null;
    children?: IExecutionProgressChild[] | null;
    cacheHit?: boolean | null;
    status?: "success" | "partialSuccess" | "failure" | null;
    errorType?: string | null;
    rows?: number | null;
    columns?: number | null;
    timing?: Record<string, unknown> | null;
    /** on a cache hit: how the cached result was originally computed, when known */
    profile?: IComputationProfile | null;
}

/**
 * Opens the execution progress stream (server sent events) of one execution.
 *
 * @remarks
 * The stream replays the events already recorded for the execution, then streams new ones and
 * closes once the root computation finishes (`event: done`). Aborting the signal closes it early.
 *
 * @internal
 */
export function streamExecutionProgress(
    authCall: TigerAuthenticatedCallGuard,
    workspace: string,
    executionId: string,
    signal?: AbortSignal,
): ReadableStream<IExecutionProgressEvent> {
    // Axios <1.7 can't stream through fetch, so the XHR's partial responseText is forwarded
    // chunk by chunk — the same approach as the gen-ai chat stream.
    let lastLoaded = 0;
    let closed = false;
    // aborts the request when the caller aborts, and when the reader cancels the stream (the
    // parser terminates it on `event: done`, so the server may still hold the connection open)
    const requestAbort = new AbortController();
    const abortRequest = () => requestAbort.abort();
    if (signal?.aborted) {
        abortRequest();
    } else {
        signal?.addEventListener("abort", abortRequest, { once: true });
    }
    const textStream = new ReadableStream<string>({
        start(controller) {
            const close = () => {
                if (!closed) {
                    closed = true;
                    controller.close();
                }
            };
            const fail = (error: unknown) => {
                if (!closed) {
                    closed = true;
                    controller.error(error);
                }
            };

            authCall((client) =>
                ExecutionAPI_StreamExecutionProgress(
                    client.axios,
                    client.basePath,
                    { workspaceId: workspace, executionId },
                    {
                        signal: requestAbort.signal,
                        headers: { Accept: "text/event-stream" },
                        responseType: "text",
                        onDownloadProgress: (evt) => {
                            const request = evt.event?.target as XMLHttpRequest | undefined;
                            if (!request || closed) {
                                return;
                            }
                            const data = request.responseText.slice(lastLoaded);
                            lastLoaded += data.length;
                            if (data) {
                                controller.enqueue(data);
                            }
                        },
                    },
                ),
            )
                .then(close)
                .catch((error) => {
                    if (requestAbort.signal.aborted) {
                        close();
                    } else {
                        fail(error);
                    }
                })
                .finally(() => signal?.removeEventListener("abort", abortRequest));
        },
        cancel() {
            closed = true;
            abortRequest();
        },
    });

    return textStream.pipeThrough(new EventSourceParserStream()).pipeThrough(new ProgressEventParser());
}

class ProgressEventParser extends TransformStream<EventSourceMessage, IExecutionProgressEvent> {
    constructor() {
        super({
            transform(message, controller) {
                if (message.event === "done") {
                    controller.terminate();
                    return;
                }
                if (message.event !== "progress" && message.event !== undefined) {
                    return;
                }
                try {
                    controller.enqueue(JSON.parse(message.data) as IExecutionProgressEvent);
                } catch {
                    // a malformed frame must not break the rest of the stream
                }
            },
        });
    }
}

//
// Registry of executions by result.
//
// AD and other consumers receive the execution result wrapped in backend decorators (caching,
// eventing), which hide the tiger result. The registry maps the result back to the execution
// that produced it, keyed by workspace + resultId (both pass through every decorator).
//

const MAX_REGISTERED_EXECUTIONS = 200;

interface IRegisteredExecution {
    executionId: string;
    workspace: string;
    authCall: TigerAuthenticatedCallGuard;
}

const executionsByResult = new Map<string, IRegisteredExecution>();

const registryKey = (workspace: string, resultId: string) => `${workspace}/${resultId}`;

/**
 * @internal
 */
export function registerExecution(
    workspace: string,
    resultId: string,
    executionId: string,
    authCall: TigerAuthenticatedCallGuard,
): void {
    const key = registryKey(workspace, resultId);
    // re-insert so the newest executions are the last to be evicted
    executionsByResult.delete(key);
    executionsByResult.set(key, { executionId, workspace, authCall });
    if (executionsByResult.size > MAX_REGISTERED_EXECUTIONS) {
        const oldest = executionsByResult.keys().next().value;
        if (oldest !== undefined) {
            executionsByResult.delete(oldest);
        }
    }
}

/**
 * Handle to the progress of the server execution that produced an execution result.
 *
 * @alpha
 */
export interface ITigerExecutionProgressHandle {
    /**
     * Server-side execution id (the X-GDC-CANCEL-TOKEN of the execute call).
     */
    executionId: string;
    /**
     * Opens the progress stream of the execution.
     */
    stream: (signal?: AbortSignal) => ReadableStream<IExecutionProgressEvent>;
    /**
     * Loads how the result was originally computed, from the result's metadata. Resolves to null
     * when the backend stored no profile for the result (e.g. results cached before the profile
     * was introduced).
     */
    loadComputationProfile: (signal?: AbortSignal) => Promise<IComputationProfile | null>;
}

/**
 * Loads the computation profile from the result metadata.
 *
 * @internal
 */
export async function loadComputationProfile(
    authCall: TigerAuthenticatedCallGuard,
    workspace: string,
    resultId: string,
    signal?: AbortSignal,
): Promise<IComputationProfile | null> {
    const response = await authCall((client) =>
        ExecutionResultAPI_RetrieveExecutionMetadata(
            client.axios,
            client.basePath,
            { workspaceId: workspace, resultId },
            { signal },
        ),
    );
    return response.data.computationProfile ?? null;
}

/**
 * Looks up the progress of the tiger execution that produced the given result. Works for results
 * wrapped by backend decorators.
 *
 * @remarks
 * Returns undefined when the result was not produced by the tiger backend or the backend did not
 * return an execution id. A result served from a client-side cache resolves to the execution that
 * originally produced it.
 *
 * @alpha
 */
export function getExecutionProgress(result: IExecutionResult): ITigerExecutionProgressHandle | undefined {
    const resultId = result.resultId?.();
    if (!resultId) {
        return undefined;
    }
    const registered = executionsByResult.get(registryKey(result.definition.workspace, resultId));
    if (!registered) {
        return undefined;
    }
    const { executionId, workspace, authCall } = registered;
    return {
        executionId,
        stream: (signal) => streamExecutionProgress(authCall, workspace, executionId, signal),
        loadComputationProfile: (signal) => loadComputationProfile(authCall, workspace, resultId, signal),
    };
}
