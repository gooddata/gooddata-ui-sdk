// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import classNames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import {
    type ExecutionCacheSaving,
    type IExecutionProgressQueryBreakdown,
    type IExecutionProgressStepViewModel,
} from "../../../store/execution_progress/execution_progress_view_model.js";

import { computeGanttBars, computeSegments, formatDuration } from "./timeline.js";

// The detailed step list of an execution (timeline, steps, federation bars, query breakdown) and
// helpers shared by the execution stats popover.

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["day", 24 * 60 * 60 * 1000],
    ["hour", 60 * 60 * 1000],
    ["minute", 60 * 1000],
    ["second", 1000],
];

/** the largest whole unit of a time span in the past, e.g. [-2, "hour"] */
export function toRelativeTime(agoMs: number): [number, Intl.RelativeTimeFormatUnit] {
    const ms = Math.max(agoMs, 0);
    const [unit, size] = RELATIVE_UNITS.find(([, unitMs]) => ms >= unitMs) ?? RELATIVE_UNITS[3];
    return [-Math.floor(ms / size), unit];
}

export function ExecutionProgressSteps({
    steps,
    serverNow,
}: {
    steps: IExecutionProgressStepViewModel[];
    serverNow: number;
}) {
    const segments = computeSegments(
        steps.map((step) => ({ id: step.kind, startedAt: step.startedAt, finishedAt: step.finishedAt })),
        serverNow,
    );
    const stateByKind = new Map(steps.map((step) => [step.kind, step.state]));

    return (
        <>
            <div className="adi-execution-progress-timeline" aria-hidden="true">
                {segments.map((segment) => (
                    <div
                        key={segment.id}
                        className={classNames(
                            "adi-execution-progress-timeline-segment",
                            `is-${segment.id}`,
                            `is-${stateByKind.get(segment.id as IExecutionProgressStepViewModel["kind"])}`,
                        )}
                        style={{ width: `${segment.widthPct}%` }}
                    />
                ))}
            </div>
            <ol className="adi-execution-progress-steps">
                {steps.map((step) => (
                    <Step key={step.kind} step={step} serverNow={serverNow} />
                ))}
            </ol>
        </>
    );
}

function Step({ step, serverNow }: { step: IExecutionProgressStepViewModel; serverNow: number }) {
    const durationMs =
        step.startedAt === undefined ? undefined : (step.finishedAt ?? serverNow) - step.startedAt;

    return (
        <li
            className={classNames(
                "adi-execution-progress-step",
                "s-execution-progress-step",
                `s-execution-progress-step-${step.kind}`,
                `is-${step.state}`,
            )}
            data-step={step.kind}
            data-state={step.state}
        >
            <div className="adi-execution-progress-step-row">
                <span className="adi-execution-progress-step-indicator" aria-hidden="true" />
                <span className="adi-execution-progress-step-label">
                    <StepLabel step={step} />
                </span>
                {step.state === "running" && step.kind === "federation" ? <WaitingOn step={step} /> : null}
                <span className="adi-execution-progress-step-duration">
                    {durationMs === undefined ? "" : formatDuration(durationMs)}
                </span>
            </div>
            {step.kind === "federation" && step.sources ? (
                <FederationSources step={step} serverNow={serverNow} />
            ) : null}
            {step.kind === "query" && step.state === "done" && step.queryBreakdown ? (
                <QueryBreakdown breakdown={step.queryBreakdown} />
            ) : null}
        </li>
    );
}

function StepLabel({ step }: { step: IExecutionProgressStepViewModel }) {
    switch (step.kind) {
        case "preparing":
            return <FormattedMessage id="executionProgress.step.preparing" />;
        case "sqlGeneration":
            return <FormattedMessage id="executionProgress.step.sqlGeneration" />;
        case "federation":
            return (
                <FormattedMessage
                    id="executionProgress.step.federation"
                    values={{ count: step.sources?.length ?? 0 }}
                />
            );
        case "query":
            if (step.cacheHit) {
                return <FormattedMessage id="executionProgress.step.query.rawCache" />;
            }
            return step.dataSourceId ? (
                <FormattedMessage
                    id="executionProgress.step.query"
                    values={{
                        dataSource: (
                            <strong title={step.dataSourceId}>
                                {dataSourceLabel(step.dataSourceId, step.dataSourceName)}
                            </strong>
                        ),
                    }}
                />
            ) : (
                <FormattedMessage id="executionProgress.step.query.unknown" />
            );
        case "postprocessing":
            return step.postprocessingTypes && step.postprocessingTypes.length > 0 ? (
                <FormattedMessage
                    id="executionProgress.step.postprocessing.types"
                    values={{ types: step.postprocessingTypes.join(", ") }}
                />
            ) : (
                <FormattedMessage id="executionProgress.step.postprocessing" />
            );
        default:
            return null;
    }
}

function WaitingOn({ step }: { step: IExecutionProgressStepViewModel }) {
    const slowest = step.sources?.find((source) => source.resultId === step.slowestSourceResultId);
    if (!slowest?.dataSourceId) {
        return null;
    }
    return (
        <span
            className="adi-execution-progress-waiting s-execution-progress-waiting"
            title={slowest.dataSourceId}
        >
            <FormattedMessage
                id="executionProgress.waitingOn"
                values={{ dataSource: dataSourceLabel(slowest.dataSourceId, slowest.dataSourceName) }}
            />
        </span>
    );
}

function FederationSources({
    step,
    serverNow,
}: {
    step: IExecutionProgressStepViewModel;
    serverNow: number;
}) {
    const intl = useIntl();
    const sources = step.sources ?? [];
    const spanStart = step.startedAt ?? serverNow;
    const spanEnd = step.finishedAt ?? serverNow;
    const bars = new Map(
        computeGanttBars(
            sources.map((source) => ({
                id: source.resultId,
                startedAt: source.startedAt,
                finishedAt: source.finishedAt,
            })),
            spanStart,
            spanEnd,
        ).map((bar) => [bar.id, bar]),
    );

    return (
        <ul className="adi-execution-progress-sources">
            {sources.map((source) => {
                const bar = bars.get(source.resultId);
                const isSlowest = source.resultId === step.slowestSourceResultId && sources.length > 1;
                const durationMs =
                    source.startedAt === undefined
                        ? undefined
                        : (source.finishedAt ?? serverNow) - source.startedAt;
                const queuedPct =
                    source.queuedMs !== undefined && durationMs
                        ? Math.min((source.queuedMs / durationMs) * 100, 100)
                        : 0;
                return (
                    <li
                        key={source.resultId}
                        className={classNames(
                            "adi-execution-progress-source",
                            "s-execution-progress-source",
                            `is-${source.state}`,
                            { "is-slowest": isSlowest },
                        )}
                        data-data-source={source.dataSourceId}
                        data-state={source.state}
                    >
                        <span className="adi-execution-progress-source-name" title={source.dataSourceId}>
                            {source.dataSourceId
                                ? dataSourceLabel(source.dataSourceId, source.dataSourceName)
                                : source.resultId}
                        </span>
                        <span className="adi-execution-progress-source-track">
                            {bar ? (
                                <span
                                    className="adi-execution-progress-source-bar"
                                    style={{ left: `${bar.offsetPct}%`, width: `${bar.widthPct}%` }}
                                >
                                    {queuedPct > 0 ? (
                                        <span
                                            className="adi-execution-progress-source-bar-queued"
                                            style={{ width: `${queuedPct}%` }}
                                        />
                                    ) : null}
                                </span>
                            ) : null}
                        </span>
                        <span className="adi-execution-progress-source-duration">
                            {source.cacheHit
                                ? intl.formatMessage({ id: "executionProgress.source.cacheHit" })
                                : durationMs === undefined
                                  ? ""
                                  : formatDuration(durationMs)}
                            {source.queuedMs === undefined
                                ? ""
                                : ` · ${intl.formatMessage(
                                      { id: "executionProgress.source.queued" },
                                      { duration: formatDuration(source.queuedMs) },
                                  )}`}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}

/** the display name of a data source; its id when the backend could not resolve the name */
export function dataSourceLabel(dataSourceId: string, dataSourceName?: string): string {
    return dataSourceName || dataSourceId;
}

/** the original end-to-end time; "~" when it ends before the post-processing */
export function formatOriginalTotal(totalDurationMs: number, approximate?: boolean): string {
    return `${approximate ? "~" : ""}${formatDuration(totalDurationMs)}`;
}

const QUERY_PARTS: Array<{ part: string; key: keyof IExecutionProgressQueryBreakdown; label: ReactNode }> = [
    { part: "waiting", key: "waitingMs", label: <FormattedMessage id="executionProgress.query.waiting" /> },
    {
        part: "database",
        key: "databaseMs",
        label: <FormattedMessage id="executionProgress.query.database" />,
    },
    {
        part: "transfer",
        key: "transferMs",
        label: <FormattedMessage id="executionProgress.query.transfer" />,
    },
];

/** where the time of the finished query went: the parts add up to the step's duration */
function QueryBreakdown({ breakdown }: { breakdown: IExecutionProgressQueryBreakdown }) {
    const totalMs = breakdown.waitingMs + breakdown.databaseMs + breakdown.transferMs;
    let offsetMs = 0;
    return (
        <ul className="adi-execution-progress-sources adi-execution-progress-query-breakdown s-execution-progress-query-breakdown">
            {QUERY_PARTS.map(({ part, key, label }) => {
                const durationMs = breakdown[key];
                const offsetPct = totalMs > 0 ? (offsetMs / totalMs) * 100 : 0;
                const widthPct = totalMs > 0 ? Math.max((durationMs / totalMs) * 100, 0.5) : 0;
                offsetMs += durationMs;
                return (
                    <li
                        key={part}
                        className={`adi-execution-progress-source adi-execution-progress-query-part is-${part} s-execution-progress-query-part`}
                        data-part={part}
                        data-duration-ms={durationMs}
                    >
                        <span className="adi-execution-progress-source-name">{label}</span>
                        <span className="adi-execution-progress-source-track">
                            <span
                                className="adi-execution-progress-source-bar"
                                style={{ left: `${Math.min(offsetPct, 99.5)}%`, width: `${widthPct}%` }}
                            />
                        </span>
                        <span className="adi-execution-progress-source-duration">
                            {formatDuration(durationMs)}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}

/** what a cache hit saved: the time when it is meaningful, otherwise the queries not run */
export function CacheSaving({ saving, className }: { saving: ExecutionCacheSaving; className: string }) {
    return (
        <div
            className={classNames("adi-execution-progress-original-saved", className)}
            data-saved-ms={saving.kind === "time" ? saving.savedMs : undefined}
        >
            {saving.kind === "time" ? (
                <FormattedMessage
                    id="executionProgress.original.saved"
                    values={{ duration: formatOriginalTotal(saving.savedMs, saving.approximate) }}
                />
            ) : (
                <FormattedMessage
                    id="executionProgress.original.savedQueries"
                    values={{ count: saving.count }}
                />
            )}
        </div>
    );
}
