// (C) 2026 GoodData Corporation

import { type Action } from "redux";

import { shortcutSetDroppedItem } from "../../actions/shortcuts_actions.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { type IAppState } from "../types.js";

import { type IShortcutDroppedItemState } from "./shortcut_dropped_item_state.js";
import {
    metricOverTimeShortcutApplied,
    metricShortcutApplied,
    shortcutPostponed,
} from "./shortcuts_operation_events.js";

/**
 * `data.shortcut.shortcutDroppedItem` — the catalog item a canvas drop PARKED while the shortcut
 * date datasets were still loading (sagas/shortcut_sagas.ts re-fires the shortcut once they
 * arrive).
 *
 * `SHORTCUT_SET_DROPPED_ITEM` writes this leaf and nothing else, so it is a plain case on the
 * trigger — no saga, no event. The shortcut operations' events join below (the apply clears the
 * parked item), and the time-travel restore fixup writes the same leaf through
 * {@link setDroppedItem}, which stays infrastructure.
 *
 * `null` when nothing is parked (see shortcut_dropped_item_state.ts).
 */
export function shortcutDroppedItemLeafReducer(
    state: IShortcutDroppedItemState | undefined,
    action: Action,
): IShortcutDroppedItemState | undefined {
    if (shortcutSetDroppedItem.match(action)) {
        return action.payload.catalogItem;
    }
    // the applies CLEAR the parked item, the postpone clears it only for the over-time variant
    // (its payload carries the current value otherwise)
    if (metricShortcutApplied.match(action)) {
        return action.payload.shortcutDroppedItem;
    }
    if (metricOverTimeShortcutApplied.match(action)) {
        return action.payload.shortcutDroppedItem;
    }
    if (shortcutPostponed.match(action)) {
        return action.payload.shortcutDroppedItem;
    }

    return state;
}

/**
 * The ROOT-STATE write the time-travel wrapper needs: undo/redo clears the parked item on every
 * restore (store/_infra/time_travel.ts#applyRestoreFixups), and a restore fixup cannot be a case
 * reducer — it runs inside the higher-order wrapper, over the whole root. Kept next to the leaf so
 * the two writers of this subtree share one module.
 */
export function setDroppedItem(state: IAppState, catalogItem: ICatalogEntry | null): IAppState {
    if (state.data.shortcut.shortcutDroppedItem === catalogItem) {
        return state;
    }

    return {
        ...state,
        data: {
            ...state.data,
            shortcut: { ...state.data.shortcut, shortcutDroppedItem: catalogItem },
        },
    };
}
