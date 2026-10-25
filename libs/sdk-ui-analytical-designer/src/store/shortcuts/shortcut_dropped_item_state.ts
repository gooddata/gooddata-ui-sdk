// (C) 2026 GoodData Corporation

import { type ICatalogEntry } from "../../typings/state_objects.js";

/**
 * `data.shortcut.shortcutDroppedItem` — the catalog item a canvas drop PARKED while the shortcut
 * date datasets were still loading (sagas/shortcut_sagas.ts re-fires the shortcut once they
 * arrive).
 *
 * `null` when nothing is parked (the combined root mounts the leaf through `nullableLeaf`, so a
 * writer clearing with `undefined` lands as `null` — indistinguishable to the one reader,
 * `selectors/shortcuts_selector.ts#getDroppedCatalogItem`).
 *
 * In its own module rather than next to the leaf reducer to keep the dependency graph acyclic: a
 * domain's state TYPE in a reducer module is what closes `events → operations → reducer` cycles,
 * because the operations need the type while the reducer consumes the events.
 */
export type IShortcutDroppedItemState = ICatalogEntry | null;
