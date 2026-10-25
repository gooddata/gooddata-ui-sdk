// (C) 2026 GoodData Corporation

import { type IDateDataset } from "../../typings/datasets.js";

/**
 * data.shortcut.shortcutDateDatasets slice state — the date datasets loaded for the
 * metric-over-time shortcut while a measure drag is in flight. Plain values.
 *
 * The SIBLING data.shortcut.shortcutDroppedItem key and data.postponedAction deliberately
 * stay OUTSIDE this slice: each is a hand-written leaf of its own
 * (shortcut_dropped_item_reducer.ts, postponed_action_reducer.ts) — the dropped item is also
 * written by time travel's undo fixup, and the parked action must not be frozen by immer.
 */
export interface IShortcutDateDatasetsState {
    loaded: boolean;
    available: IDateDataset[];
    /** count of unavailable datasets, present once the first load finishes */
    unavailable?: number;
    error: Error | null;
}

export const shortcutDateDatasetsInitialState: IShortcutDateDatasetsState = {
    loaded: false,
    available: [],
    error: null,
};
