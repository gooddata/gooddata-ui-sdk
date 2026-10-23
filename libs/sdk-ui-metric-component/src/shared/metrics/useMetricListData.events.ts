// (C) 2021-2026 GoodData Corporation

import { groupBy, isEqual } from "lodash-es";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { type IEvent } from "../eventing/EventContext.js";
import { EventCategories, Events } from "../eventing/events.js";

export type WorkspaceMetricStats = {
    numberOfSameNames: number;
    numberOfSameExpressions: number;
};

function getSameItemNumber<T>(collection: T[], iteratee: (i: T) => string | number) {
    const groups = groupBy(collection, iteratee);
    return Object.values(groups).filter((group: unknown[]) => group.length > 1).length;
}

function calculateWorkspaceMetricStats(data: IMeasureMetadataObject[]): WorkspaceMetricStats {
    const numberOfSameNames = getSameItemNumber(data, (metric: IMeasureMetadataObject) => metric.title);
    const numberOfSameExpressions = getSameItemNumber(
        data,
        (metric: IMeasureMetadataObject) => metric.expression,
    );

    return { numberOfSameNames, numberOfSameExpressions };
}

let workspaceMetricStats: null | WorkspaceMetricStats = null;

function workspaceMetricDataEvent(data: IMeasureMetadataObject[]): IEvent | null {
    const stats = calculateWorkspaceMetricStats(data);
    if (workspaceMetricStats && !isEqual(stats, workspaceMetricStats)) {
        return workspaceMetricStatsChangedEvent(stats);
    }
    workspaceMetricStats = stats;
    return null;
}

export const events = {
    workspaceMetricDataEvent,
};

function workspaceMetricStatsChangedEvent(stats: WorkspaceMetricStats): IEvent {
    return {
        action: Events.workspaceMetricStatsChanged,
        category: EventCategories.metricList,
        variables: stats,
    };
}
