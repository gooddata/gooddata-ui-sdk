// (C) 2026 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import { type IntlShape, useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { UiAiThinkingIcon, UiIconButton } from "@gooddata/sdk-ui-kit";

import {
    type IExecutionLoadingStepViewModel,
    advanceStepReveal,
    buildExecutionLoadingViewModel,
    initialStepRevealState,
    loadingStepDuration,
    nextStepRevealAt,
    revealedLoadingSteps,
} from "../../../store/execution_progress/execution_loading_view_model.js";
import { getExecutionProgressViewModel } from "../../../store/execution_progress/execution_progress_selectors.js";
import { ReportComputing } from "../ReportComputing.js";

import { dataSourceLabel } from "./ExecutionProgressSteps.js";
import { computeGanttBars } from "./timeline.js";

/** no progress event by then: the generic spinner is shown instead */
const NO_EVENT_FALLBACK_MS = 1500;
/** the stream may lag behind a settled report execution at most this long */
const MAX_STREAM_LAG_MS = 10_000;
const TICK_MS = 250;

function useNow(enabled: boolean): number {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!enabled) {
            return undefined;
        }
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), TICK_MS);
        return () => clearInterval(timer);
    }, [enabled]);
    return now;
}

export interface IExecutionProgressPanelProps {
    isExecutionRunning: boolean;
}

/**
 * The loading view of the report execution, in place of the computing spinner: the "Rendering
 * visualisation" header, with the sub-steps appended below it (revealed one by one) when the data comes
 * from the data source. Falls back to the spinner when no progress arrives.
 *
 * Everything sits in one fixed-width box, so the block keeps its place while the text changes.
 */
export function ExecutionProgressPanel({ isExecutionRunning }: IExecutionProgressPanelProps) {
    const viewModel = useSelector(getExecutionProgressViewModel);
    // the view follows a stream that lags behind the settled report (e.g. a mocked stream); a
    // finished stream closes it at once — there is no hold after the finish
    const streamLagging =
        !viewModel.unavailable &&
        viewModel.hasEvents &&
        (viewModel.phase === "running" || viewModel.phase === "waiting") &&
        viewModel.reportFinishedAt !== undefined &&
        Date.now() - viewModel.reportFinishedAt < MAX_STREAM_LAG_MS;
    const active = isExecutionRunning || streamLagging;
    const now = useNow(active);
    // the view re-renders on every tick; the steps change only with the progress
    const loading = useMemo(() => buildExecutionLoadingViewModel(viewModel), [viewModel]);

    if (!active) {
        return null;
    }

    const showsProgress =
        viewModel.source === "browserCache" ||
        viewModel.hasEvents ||
        (!viewModel.unavailable &&
            (viewModel.reportStartedAt === undefined ||
                now - viewModel.reportStartedAt < NO_EVENT_FALLBACK_MS));
    if (!showsProgress) {
        return isExecutionRunning ? <ReportComputing /> : null;
    }

    return (
        <div
            className="adi-execution-progress s-execution-progress"
            data-phase={viewModel.phase}
            data-mode={loading.mode}
            data-cache-hit={viewModel.cacheHit || viewModel.source === "browserCache" ? "true" : undefined}
        >
            <div className="adi-execution-progress-box">
                {/* a new report execution starts a new reveal queue */}
                <LoadingSteps
                    key={viewModel.reportStartedAt ?? "none"}
                    steps={loading.steps}
                    serverNow={now - viewModel.clockOffsetMs}
                />
            </div>
        </div>
    );
}

const COLLAPSED_STORAGE_KEY = "adi-execution-progress-collapsed";

function readCollapsed(): boolean {
    try {
        return window.localStorage?.getItem(COLLAPSED_STORAGE_KEY) === "true";
    } catch {
        return false;
    }
}

function writeCollapsed(collapsed: boolean): void {
    try {
        window.localStorage?.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
    } catch {
        // a convenience only: without storage the state is not remembered
    }
}

/**
 * The persistent "Rendering visualisation" header with the animated sparkle and, once there are
 * sub-steps, the collapse toggle; below it the sub-steps revealed so far in chronological order, at
 * least STEP_REVEAL_GAP_MS apart even when they started together.
 */
function LoadingSteps({ steps, serverNow }: { steps: IExecutionLoadingStepViewModel[]; serverNow: number }) {
    const intl = useIntl();
    const [reveal, setReveal] = useState(initialStepRevealState);
    const [collapsed, setCollapsed] = useState(readCollapsed);
    const started = steps.length;

    useEffect(() => {
        const dueAt = nextStepRevealAt(reveal, started);
        if (dueAt === undefined) {
            return undefined;
        }
        const timer = setTimeout(
            () => setReveal((current) => advanceStepReveal(current, started, Date.now())),
            Math.max(0, dueAt - Date.now()),
        );
        return () => clearTimeout(timer);
    }, [reveal, started]);

    const shown = revealedLoadingSteps(steps, Math.min(reveal.revealed, started));
    const header = intl.formatMessage({ id: "executionProgress.loading.render" });
    const toggleLabel = collapsed
        ? intl.formatMessage({ id: "executionProgress.toggle.expand" })
        : intl.formatMessage({ id: "executionProgress.toggle.collapse" });
    const toggle = () => {
        setCollapsed(!collapsed);
        writeCollapsed(!collapsed);
    };

    // only the step transitions are announced, not the ticking durations or the toggle
    const latest = shown[shown.length - 1];
    const announcement = latest ? loadingStepLabel(intl, latest) : header;

    return (
        <>
            <span className="sr-only" role="status" aria-live="polite">
                {announcement}
            </span>
            <div className="adi-execution-progress-header s-execution-progress-header">
                <span className="adi-execution-progress-step-marker">
                    <UiAiThinkingIcon />
                </span>
                <span className="adi-execution-progress-header-label" title={header}>
                    {header}
                </span>
                {shown.length > 0 ? (
                    <span className="adi-execution-progress-toggle">
                        <UiIconButton
                            icon={collapsed ? "chevronDown" : "chevronUp"}
                            size="medium"
                            variant="tertiary"
                            label={toggleLabel}
                            onClick={toggle}
                            dataTestId="s-execution-progress-toggle"
                            ariaAttributes={{ role: "button", "aria-expanded": !collapsed }}
                        />
                    </span>
                ) : null}
            </div>
            {shown.length > 0 && !collapsed ? (
                <ol className="adi-execution-progress-list s-execution-progress-list">
                    {shown.map((step) => (
                        <LoadingStep key={step.kind} step={step} serverNow={serverNow} />
                    ))}
                </ol>
            ) : null}
        </>
    );
}

function LoadingStep({ step, serverNow }: { step: IExecutionLoadingStepViewModel; serverNow: number }) {
    const intl = useIntl();
    const duration = loadingStepDuration(step, serverNow);
    const label = loadingStepLabel(intl, step);
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
                <span className="adi-execution-progress-step-marker" aria-hidden="true">
                    <span className="adi-execution-progress-dot" />
                </span>
                <span className="adi-execution-progress-step-label" title={label}>
                    {label}
                </span>
                {/* reserved, so the label never shifts when the timer appears */}
                <span className="adi-execution-progress-step-duration s-execution-progress-step-duration">
                    {duration ?? ""}
                </span>
            </div>
            {step.kind === "query" && step.sources && step.sources.length > 1 ? (
                <LoadingSources step={step} serverNow={serverNow} />
            ) : null}
        </li>
    );
}

function loadingStepLabel(intl: IntlShape, step: IExecutionLoadingStepViewModel): string {
    switch (step.kind) {
        case "cache":
            return intl.formatMessage({ id: "executionProgress.loading.cache" });
        case "prepare":
            return intl.formatMessage({ id: "executionProgress.loading.prepare" });
        case "query":
            return step.dataSourceId && !(step.sources && step.sources.length > 1)
                ? intl.formatMessage(
                      { id: "executionProgress.loading.query.dataSource" },
                      { dataSource: dataSourceLabel(step.dataSourceId, step.dataSourceName) },
                  )
                : intl.formatMessage({ id: "executionProgress.loading.query" });
        case "render":
            return intl.formatMessage({ id: "executionProgress.loading.render" });
        default:
            return "";
    }
}

/** the federated data sources: one row each, the slowest highlighted */
function LoadingSources({ step, serverNow }: { step: IExecutionLoadingStepViewModel; serverNow: number }) {
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
    const slowest = sources.find((source) => source.resultId === step.slowestSourceResultId);
    const waitingOn =
        step.state === "running" && slowest?.dataSourceId
            ? intl.formatMessage(
                  { id: "executionProgress.waitingOn" },
                  { dataSource: dataSourceLabel(slowest.dataSourceId, slowest.dataSourceName) },
              )
            : undefined;

    return (
        <div className="adi-execution-progress-federation">
            {waitingOn ? (
                <div
                    className="adi-execution-progress-waiting s-execution-progress-waiting"
                    title={waitingOn}
                >
                    {waitingOn}
                </div>
            ) : null}
            <ul className="adi-execution-progress-sources">
                {sources.map((source) => {
                    const bar = bars.get(source.resultId);
                    const duration = loadingStepDuration(source, serverNow);
                    const name = source.dataSourceId
                        ? dataSourceLabel(source.dataSourceId, source.dataSourceName)
                        : source.resultId;
                    return (
                        <li
                            key={source.resultId}
                            className={classNames(
                                "adi-execution-progress-source",
                                "s-execution-progress-source",
                                `is-${source.state}`,
                                { "is-slowest": source.resultId === step.slowestSourceResultId },
                            )}
                            data-data-source={source.dataSourceId}
                            data-state={source.state}
                        >
                            <span className="adi-execution-progress-source-name" title={name}>
                                {name}
                            </span>
                            <span className="adi-execution-progress-source-track">
                                {bar ? (
                                    <span
                                        className="adi-execution-progress-source-bar"
                                        style={{ left: `${bar.offsetPct}%`, width: `${bar.widthPct}%` }}
                                    />
                                ) : null}
                            </span>
                            <span className="adi-execution-progress-source-duration">{duration ?? ""}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
