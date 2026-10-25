// (C) 2021-2026 GoodData Corporation

//
// Tracking Backend interfaces
//
import { type InsightStats } from "./custom_variables.js";

/**
 * Keeps only meaningful entries (drops `undefined` / `null` / `""`, but keeps `0` / `false`) — used to
 * build the neutral identifier / stat groups so empty values don't ride along as blank fields.
 */
function definedEntries<T>(record: Record<string, T>): Record<string, NonNullable<T>> {
    return Object.fromEntries(
        Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== ""),
    ) as Record<string, NonNullable<T>>;
}

export type TrackingPayloadType = "event" | "page" | "timing";

export interface ITrackingPayload {
    _type: TrackingPayloadType;
}

export interface IEventTrackingPayload extends ITrackingPayload {
    _type: "event";
    workspaceId: string;
    reportId?: string;

    /**
     * Event category. If not specified will be defaulted to `analyticalDesigner`
     */
    category?: string;
    action: string;
    label: string;
    value?: number | string;
    insightStats?: InsightStats;
    dataSamplingPercentage?: number;
    [key: string]: unknown;
}

export interface IPageViewTrackingPayload extends ITrackingPayload {
    _type: "page";
    workspaceId: string;
    reportId?: string;
    page?: string;
    location?: string;
    [key: string]: unknown;
}

export interface ITimingTrackingPayload extends ITrackingPayload {
    _type: "timing";
    label: string;
    value: number;
    variable: string;
    [key: string]: unknown;
}

export type AnyTrackingPayload = IEventTrackingPayload | IPageViewTrackingPayload | ITimingTrackingPayload;

//
// Tracker implementations
//

export class TelemetryTracker {
    private trackers: AbstractAnalyticsTracker[] = [];
    private isSendingEvents: boolean = false;
    private hasReplayedAccumulated: boolean = false;

    /**
     * When all trackers are loaded and registered, keeps record of accumulated events
     * and propagates it to current trackers.
     *
     * @remarks
     * The accumulator buffers events emitted before the first initialization and is never drained, so the
     * replay below runs only once. This tracker is a module-level singleton that survives host
     * unmount→remount (pluggable mode), where the telemetry bootstrap re-runs on every mount — without the
     * guard those early buffered events would be re-forwarded to the host on each remount.
     */
    public startReportingEvents() {
        this.isSendingEvents = true;

        if (this.hasReplayedAccumulated) {
            return;
        }
        this.hasReplayedAccumulated = true;

        const accumulatingTracker = this.trackers.find((tracker) => tracker.isAccumulatorTracker());

        this.trackers.forEach((tracker) => {
            if (!tracker.isAccumulatorTracker()) {
                tracker.trackAccumulated(accumulatingTracker);
            }
        });
    }

    /**
     * Register new tracker.
     *
     * @param tracker - tracker to register
     */
    public registerTracker(tracker: AbstractAnalyticsTracker) {
        this.trackers.push(tracker);
    }

    /**
     * Iterates through existing trackers and sends application event.
     *
     * @param payload - event payload
     */
    public trackEvent(payload: IEventTrackingPayload) {
        this.trackers.forEach((tracker) => {
            if (this.isSendingEvents !== tracker.isAccumulatorTracker()) {
                tracker.trackEvent(payload);
            }
        });
    }

    /**
     * Iterates through existing trackers and sends application page view.
     *
     * @param payload - page view payload
     */
    public trackPageView(payload: IPageViewTrackingPayload) {
        this.trackers.forEach((tracker) => {
            if (this.isSendingEvents !== tracker.isAccumulatorTracker()) {
                tracker.trackPageView(payload);
            }
        });
    }

    /**
     * Iterates through existing trackers and sends application timing information.
     *
     * @param payload - timing payload
     */
    public trackTiming(payload: ITimingTrackingPayload) {
        this.trackers.forEach((tracker) => {
            if (this.isSendingEvents !== tracker.isAccumulatorTracker()) {
                tracker.trackTiming(payload);
            }
        });
    }
}

/**
 * Abstract superclass for all trackers. This already implements some base functionality and
 * through the different abstract methods specifies the interface to implement in the concrete trackers.
 *
 * The different implementations need to transform the payload to whatever the backend accepts and send it
 * out.
 */
export abstract class AbstractAnalyticsTracker extends TelemetryTracker {
    /**
     * Tracks application event.
     *
     * @param payload - event payload
     */
    public abstract override trackEvent(payload: IEventTrackingPayload): void;

    /**
     * Tracks application page view.
     *
     * @param payload - page view payload
     */
    public abstract override trackPageView(payload: IPageViewTrackingPayload): void;

    /**
     * Tracks application timing information.
     *
     * @param payload - timing payload
     */
    public abstract override trackTiming(payload: ITimingTrackingPayload): void;

    /**
     * Some tracker implementations may accumulating tracking payloads instead of sending them out. Those
     * trackers should return the accumulated events through
     */
    public getAccumulated(): AnyTrackingPayload[] {
        return [];
    }

    /**
     * Returns whether actual tracker is of type accumulative or not.
     */
    public abstract isAccumulatorTracker(): boolean;

    /**
     * Track all payloads that may be accumulated in the 'other' tracker.
     *
     * @param other - the other tracker with accumulated payloads
     */
    public trackAccumulated(other: AbstractAnalyticsTracker): void {
        other.getAccumulated().forEach((payload) => {
            switch (payload._type) {
                case "event": {
                    this.trackEvent(payload);
                    break;
                }
                case "page": {
                    this.trackPageView(payload);
                    break;
                }
                case "timing": {
                    this.trackTiming(payload);
                    break;
                }
            }
        });
    }
}

/**
 * This implementation of analytics tracker will hoard the different payloads to track in the order which they
 * are submitted. The tracker will not do anything apart from that. The accumulated payloads can be retrieved
 * at later time.
 *
 * The purpose of this tracker is to hold onto various tracking payloads that the app MAY try to dispatch before
 * the tracking is fully initialized. This can happen in some contexts - such as in Tiger where the tracking is
 * only enabled later on as the app learns whether the telemetry is setup for the current user.
 */
export class AccumulatingTracker extends AbstractAnalyticsTracker {
    private readonly accumulator: AnyTrackingPayload[] = [];

    public override trackEvent(payload: IEventTrackingPayload): void {
        this.accumulator.push(payload);
    }

    public override trackPageView(payload: IPageViewTrackingPayload): void {
        this.accumulator.push(payload);
    }

    public override trackTiming(payload: ITimingTrackingPayload): void {
        this.accumulator.push(payload);
    }

    public override getAccumulated(): AnyTrackingPayload[] {
        return this.accumulator;
    }

    public isAccumulatorTracker(): boolean {
        return true;
    }
}

/**
 * This implementation of analytics tracker does nothing. It sinks all the events.
 */
export class NoopAnalyticsTracker extends AbstractAnalyticsTracker {
    public trackEvent(_payload: IEventTrackingPayload): void {}

    public trackPageView(_payload: IPageViewTrackingPayload): void {}

    public trackTiming(_payload: ITimingTrackingPayload): void {}

    public isAccumulatorTracker(): boolean {
        return false;
    }
}

/**
 * Host shell telemetry callbacks, as supplied to a pluggable application at mount time.
 *
 * @remarks
 * Structurally mirrors `IPluggableAppTelemetryCallbacks` from `@gooddata/sdk-pluggable-application-model`.
 * It is duplicated here so this legacy runtime does not take on a new package dependency; the real type
 * from the module is structurally assignable to it.
 */
export interface IHostTelemetryCallbacks {
    trackEvent: (
        eventName: string,
        data?: Record<string, unknown>,
        options?: { channel?: "standard" | "ai" },
    ) => void;
    trackPageView: (page: string, data?: Record<string, unknown>) => void;
    trackTiming: (variable: string, label: string, valueMs: number, data?: Record<string, unknown>) => void;
}

/**
 * Tracker used when Analytical Designer runs as a pluggable application: instead of talking to its own
 * page-level providers, it forwards every payload to the host shell's telemetry
 * callbacks. The host owns provider configuration and tags forwarded events with the source application id.
 */
export class HostForwardingTracker extends AbstractAnalyticsTracker {
    constructor(private callbacks: IHostTelemetryCallbacks | undefined) {
        super();
    }

    public setCallbacks(callbacks: IHostTelemetryCallbacks | undefined): void {
        this.callbacks = callbacks;
    }

    public trackEvent(payload: IEventTrackingPayload): void {
        // Forward a backend-neutral event: sensitive ids in `identifiers` (host hashes them), per-event
        // metrics in `stats`; the host decides how to record them. `_type` is an internal discriminator.
        const { _type, action, workspaceId, reportId, insightStats, dataSamplingPercentage, ...rest } =
            payload;
        const identifiers = definedEntries({
            workspaceId,
            reportId: reportId && reportId !== "reportId" ? reportId : undefined,
        });
        const stats = definedEntries({
            ...(insightStats
                ? {
                      insightVisType: insightStats.visType,
                      insightBuckets: insightStats.bucketNames?.join("|"),
                      insightProperties: insightStats.propertyNames?.join("|"),
                  }
                : {}),
            dataSamplingPercentage,
        });
        this.callbacks?.trackEvent(action, {
            ...rest,
            ...(Object.keys(identifiers).length > 0 ? { identifiers } : {}),
            ...(Object.keys(stats).length > 0 ? { stats } : {}),
        });
    }

    public trackPageView(payload: IPageViewTrackingPayload): void {
        // Forward the page view's sensitive ids as `identifiers` so the host keeps its workspace/report
        // attribution (the host hashes + packs them), matching the event path.
        const identifiers = definedEntries({
            workspaceId: payload.workspaceId,
            reportId: payload.reportId && payload.reportId !== "reportId" ? payload.reportId : undefined,
        });
        this.callbacks?.trackPageView(
            payload.page ?? "analyze",
            Object.keys(identifiers).length > 0 ? { identifiers } : undefined,
        );
    }

    public trackTiming(payload: ITimingTrackingPayload): void {
        this.callbacks?.trackTiming(payload.variable, payload.label, payload.value);
    }

    public isAccumulatorTracker(): boolean {
        return false;
    }
}
