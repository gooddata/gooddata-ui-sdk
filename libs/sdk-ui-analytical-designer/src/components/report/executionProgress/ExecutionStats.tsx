// (C) 2026 GoodData Corporation

import { useId, useState } from "react";

import { FormattedMessage, type IntlShape, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { UiIcon, UiPopover, UiTooltip } from "@gooddata/sdk-ui-kit";

import { executionStatsOpened } from "../../../store/execution_progress/execution_progress_actions.js";
import { getExecutionStatsViewModel } from "../../../store/execution_progress/execution_progress_selectors.js";
import { type IExecutionProgressOriginalSourceViewModel } from "../../../store/execution_progress/execution_progress_view_model.js";
import { type IExecutionStatsViewModel } from "../../../store/execution_progress/execution_stats_view_model.js";

import {
    CacheSaving,
    ExecutionProgressSteps,
    dataSourceLabel,
    formatOriginalTotal,
    toRelativeTime,
} from "./ExecutionProgressSteps.js";
import { formatDuration } from "./timeline.js";

export interface IExecutionStatsProps {
    isExecutionRunning: boolean;
}

/**
 * The stats of the last report execution, kept after the loading view closed: a small link at the
 * bottom right of the canvas ("Live data" / "Saved result") with a one-line summary on hover and the
 * details on click.
 */
export function ExecutionStats({ isExecutionRunning }: IExecutionStatsProps) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const stats = useSelector(getExecutionStatsViewModel);
    const [isOpen, setIsOpen] = useState(false);
    const summaryId = useId();

    if (isExecutionRunning || !stats.available || !stats.reportExecutionId || stats.load === "unknown") {
        return null;
    }
    const reportExecutionId = stats.reportExecutionId;
    const summary = formatSummary(intl, stats);
    const label = intl.formatMessage({ id: "executionStats.title" });

    return (
        <div className="adi-execution-stats-anchor">
            <UiTooltip
                content={summary}
                triggerBy={["hover", "focus"]}
                arrowPlacement="right"
                disabled={isOpen}
                anchor={
                    <span className="adi-execution-stats-tooltip-anchor">
                        <UiPopover
                            title={label}
                            closeVisible
                            closeText={intl.formatMessage({ id: "executionStats.close" })}
                            arrowPlacement="bottom-end"
                            width={360}
                            onOpen={() => {
                                setIsOpen(true);
                                if (stats.showsOriginal) {
                                    dispatch(executionStatsOpened({ reportExecutionId }));
                                }
                            }}
                            onClose={() => setIsOpen(false)}
                            anchor={
                                <button
                                    type="button"
                                    className="adi-execution-stats-trigger s-execution-stats-trigger"
                                    aria-describedby={summaryId}
                                    data-load={stats.load}
                                >
                                    {stats.load === "fresh" ? (
                                        <DatabaseIcon />
                                    ) : (
                                        <UiIcon type="history" size={12} color="currentColor" />
                                    )}
                                    <span className="adi-execution-stats-trigger-text">
                                        {stats.load === "fresh" ? (
                                            <FormattedMessage id="executionStats.link.live" />
                                        ) : (
                                            <FormattedMessage id="executionStats.link.saved" />
                                        )}
                                    </span>
                                </button>
                            }
                            content={<ExecutionStatsContent stats={stats} summary={summary} />}
                        />
                        {/* the description of the trigger; its name stays the visible text */}
                        <span id={summaryId} className="sr-only">
                            {summary}
                        </span>
                    </span>
                }
            />
        </div>
    );
}

function formatSummary(intl: IntlShape, stats: IExecutionStatsViewModel): string {
    const duration = stats.totalMs === undefined ? "" : formatDuration(intl, stats.totalMs);
    if (stats.failed) {
        return intl.formatMessage({ id: "executionStats.summary.failed" }, { duration });
    }
    switch (stats.load) {
        case "cacheHit":
            return intl.formatMessage({ id: "executionStats.summary.cacheHit" }, { duration });
        case "browserCache":
            return intl.formatMessage({ id: "executionStats.summary.browserCache" }, { duration });
        default:
            // "fresh"; an unknown load shows no stats
            return intl.formatMessage({ id: "executionStats.summary.fresh" }, { duration });
    }
}

function ExecutionStatsContent({ stats, summary }: { stats: IExecutionStatsViewModel; summary: string }) {
    const { progress } = stats;
    // the steps of a settled load end at the root's finish; a step the stream did not see finish
    // ends at the report's finish (on the server clock), so its duration does not keep growing
    const serverNow =
        progress.finishedAt ?? (progress.reportFinishedAt ?? Date.now()) - progress.clockOffsetMs;

    return (
        <div className="adi-execution-stats s-execution-stats" data-load={stats.load}>
            <section className="adi-execution-stats-section s-execution-stats-this-load">
                <h4 className="adi-execution-stats-heading">
                    <FormattedMessage id="executionStats.thisLoad" />
                </h4>
                <div className="adi-execution-stats-summary s-execution-stats-summary">{summary}</div>
                {progress.steps.length > 0 ? (
                    <div className="adi-execution-stats-steps">
                        <ExecutionProgressSteps steps={progress.steps} serverNow={serverNow} />
                    </div>
                ) : null}
            </section>
            {stats.showsOriginal ? (
                <section className="adi-execution-stats-section s-execution-stats-original">
                    <h4 className="adi-execution-stats-heading">
                        <FormattedMessage id="executionStats.original" />
                    </h4>
                    <OriginalComputationStats stats={stats} serverNow={Date.now() - progress.clockOffsetMs} />
                </section>
            ) : null}
        </div>
    );
}

function OriginalComputationStats({
    stats,
    serverNow,
}: {
    stats: IExecutionStatsViewModel;
    serverNow: number;
}) {
    const intl = useIntl();
    const { status, computation } = stats.original;

    if (status === "idle" || status === "loading") {
        return (
            <div className="adi-execution-stats-note s-execution-stats-original-loading">
                <FormattedMessage id="executionStats.original.loading" />
            </div>
        );
    }
    if (status === "missing") {
        return (
            <div className="adi-execution-stats-note s-execution-stats-original-missing">
                <FormattedMessage id="executionStats.original.missing" />
            </div>
        );
    }
    if (!computation) {
        return (
            <div className="adi-execution-stats-note s-execution-stats-original-unavailable">
                <FormattedMessage id="executionStats.original.unavailable" />
            </div>
        );
    }

    const { computedAt, totalDurationMs } = computation;
    const ago =
        computedAt === undefined
            ? undefined
            : intl.formatRelativeTime(...toRelativeTime(serverNow - computedAt));
    const duration =
        totalDurationMs === undefined
            ? undefined
            : formatOriginalTotal(intl, totalDurationMs, computation.totalApproximate);
    const approximateTitle = computation.totalApproximate
        ? intl.formatMessage({ id: "executionProgress.original.approximate" })
        : undefined;
    const computedAtTitle =
        computedAt === undefined
            ? undefined
            : intl.formatDate(computedAt, { dateStyle: "medium", timeStyle: "medium" });
    return (
        <>
            {ago === undefined && duration === undefined ? null : (
                <div
                    className="adi-execution-stats-computed-at s-execution-stats-computed-at"
                    title={[computedAtTitle, approximateTitle].filter(Boolean).join(" · ") || undefined}
                    data-total-duration-ms={totalDurationMs}
                    data-approximate={computation.totalApproximate ? "true" : undefined}
                >
                    {duration === undefined ? (
                        <FormattedMessage id="executionStats.original.computedAt" values={{ ago }} />
                    ) : ago === undefined ? (
                        <FormattedMessage id="executionStats.original.computedIn" values={{ duration }} />
                    ) : (
                        <FormattedMessage
                            id="executionStats.original.computedInAgo"
                            values={{ duration, ago }}
                        />
                    )}
                </div>
            )}
            {computation.sources.length === 1 ? (
                <OriginalSourceLine source={computation.sources[0]} />
            ) : computation.sources.length > 1 ? (
                <table className="adi-execution-stats-sources">
                    <thead>
                        <tr>
                            <th>
                                <FormattedMessage id="executionStats.original.dataSource" />
                            </th>
                            <th>
                                <FormattedMessage id="executionStats.original.querying" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {computation.sources.map((source, index) => (
                            <tr
                                key={`${source.dataSourceId ?? ""}-${index}`}
                                className="s-execution-stats-original-source"
                                data-data-source={source.dataSourceId}
                                data-querying-ms={source.queryingMs}
                                title={formatSourceBreakdown(intl, source)}
                            >
                                <td className="adi-execution-stats-source-name">
                                    {source.dataSourceId
                                        ? dataSourceLabel(source.dataSourceId, source.dataSourceName)
                                        : "–"}
                                </td>
                                <td>
                                    {source.queryingMs === undefined
                                        ? "–"
                                        : formatDuration(intl, source.queryingMs)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : null}
            {stats.saved ? <CacheSaving saving={stats.saved} className="s-execution-stats-saved" /> : null}
        </>
    );
}

/** the database time and the query + upload of a source, for its title */
function formatSourceBreakdown(
    intl: IntlShape,
    source: IExecutionProgressOriginalSourceViewModel,
): string | undefined {
    if (source.dbDurationMs === undefined && source.totalDurationMs === undefined) {
        return undefined;
    }
    return intl.formatMessage(
        { id: "executionStats.original.breakdown" },
        {
            database: source.dbDurationMs === undefined ? "–" : formatDuration(intl, source.dbDurationMs),
            upload: source.totalDurationMs === undefined ? "–" : formatDuration(intl, source.totalDurationMs),
        },
    );
}

/** the only data source of the original computation: one line instead of a table */
function OriginalSourceLine({ source }: { source: IExecutionProgressOriginalSourceViewModel }) {
    const intl = useIntl();
    const dataSource = source.dataSourceId ? (
        <strong title={source.dataSourceId}>
            {dataSourceLabel(source.dataSourceId, source.dataSourceName)}
        </strong>
    ) : (
        intl.formatMessage({ id: "executionProgress.original.unknownDataSource" })
    );
    return (
        <div
            className="adi-execution-stats-original-line s-execution-stats-original-source"
            data-data-source={source.dataSourceId}
            data-querying-ms={source.queryingMs}
            title={formatSourceBreakdown(intl, source)}
        >
            {source.queryingMs === undefined ? (
                <FormattedMessage
                    id="executionStats.original.queryingSource.noDuration"
                    values={{ dataSource }}
                />
            ) : (
                <FormattedMessage
                    id="executionStats.original.queryingSource"
                    values={{ dataSource, duration: formatDuration(intl, source.queryingMs) }}
                />
            )}
        </div>
    );
}

function DatabaseIcon() {
    return (
        <svg
            className="adi-execution-stats-trigger-icon"
            viewBox="0 0 16 16"
            width="12"
            height="12"
            aria-hidden="true"
        >
            <ellipse cx="8" cy="3.5" rx="5.5" ry="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path
                d="M2.5 3.5v9c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-9M2.5 8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
            />
        </svg>
    );
}
