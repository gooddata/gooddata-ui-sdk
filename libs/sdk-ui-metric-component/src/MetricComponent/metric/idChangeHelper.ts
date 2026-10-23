// (C) 2021-2026 GoodData Corporation

import { type MetricIdConflicts } from "../ConflictContext/useConflictDetection.js";
import { SaveNameMode } from "../Content/EditMetricContent.data.js";

export function metricHasChangedId(
    previousId: string | undefined,
    currentId: string | undefined,
    saveMode?: SaveNameMode,
    force?: boolean,
): boolean {
    return Boolean(previousId && currentId !== previousId && !force && saveMode !== SaveNameMode.saveAsNew);
}

export function metricOverridesExistingId(
    _previousId: string | undefined,
    currentId: string | undefined,
    conflicts: MetricIdConflicts,
    force?: boolean,
): MetricIdConflicts {
    if (!currentId || force) {
        return { conflictWith: [], usableIds: [] };
    }
    return conflicts;
}
