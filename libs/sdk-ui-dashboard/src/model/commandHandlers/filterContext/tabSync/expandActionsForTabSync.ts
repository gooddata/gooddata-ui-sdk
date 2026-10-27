// (C) 2026 GoodData Corporation

import { type Action, type PayloadAction } from "@reduxjs/toolkit";
import { BATCH, type BatchAction } from "redux-batched-actions";

import { tabsActions, tabsSliceReducer } from "../../../store/tabs/index.js";
import { type ITabsState, getTabOrActive } from "../../../store/tabs/tabsState.js";

import { tabSyncRules } from "./tabSyncRules.js";
import { type ITabSyncScope } from "./tabSyncScope.js";

type MaybeTabTargetedPayload = { readonly tabLocalIdentifier?: string } | undefined;

/**
 * Returns `actions` followed, after each one, by its copies for the other tabs.
 *
 * Every action is planned against the state that the preceding actions and their copies produce,
 * so e.g. removing an ignore-list entry after removing the filter sees which tabs still use it.
 * Actions with a sync rule but without a tab are addressed to the scope source tab, so that they
 * are applied to the tab they are planned for. Nothing is mirrored when the scope is disabled.
 *
 * @internal
 */
export function expandActionsForTabSync(
    state: ITabsState,
    actions: readonly Action[],
    scope: ITabSyncScope,
): Action[] {
    const sourceActions = actions
        .flatMap(unbatched)
        .map((action) => addressedToSourceTab(action, scope.sourceTabLocalIdentifier));
    if (!scope.enabled) {
        return sourceActions;
    }

    const result: Action[] = [];
    let current = state;
    for (const action of sourceActions) {
        const after = tabsSliceReducer(current, action);
        const mirrored = mirrorAction(current, after, action, scope);
        result.push(action, ...mirrored);
        current = mirrored.reduce(tabsSliceReducer, after);
    }
    return result;
}

function mirrorAction(state: ITabsState, after: ITabsState, action: Action, scope: ITabSyncScope): Action[] {
    const rule = tabSyncRules.get(action.type);
    if (!rule) {
        return [];
    }

    const payload = (action as PayloadAction<MaybeTabTargetedPayload>).payload;
    const sourceTabLocalIdentifier = payload?.tabLocalIdentifier ?? scope.sourceTabLocalIdentifier;
    const source = getTabOrActive(state, sourceTabLocalIdentifier);
    const sourceAfter = getTabOrActive(after, sourceTabLocalIdentifier);
    if (!source || !sourceAfter) {
        return [];
    }

    const ctx = { scope, state, source, sourceAfter };
    return (state.tabs ?? []).flatMap((target) => {
        if (target.localIdentifier === source.localIdentifier) {
            return [];
        }
        return rule(payload, target, ctx).map((targetAction) => ({
            ...targetAction,
            payload: { ...targetAction.payload, tabLocalIdentifier: target.localIdentifier },
        }));
    });
}

/**
 * Reducers of actions without a tab apply them to the active tab, which is not the source tab
 * when a handler works on another tab.
 */
function addressedToSourceTab(action: Action, sourceTabLocalIdentifier: string | undefined): Action {
    if (!sourceTabLocalIdentifier || !tabSyncRules.has(action.type)) {
        return action;
    }
    if (tabsActions.addAttributeFilterDisplayForm.match(action)) {
        const { payload } = action;
        return "displayForm" in payload
            ? tabsActions.addAttributeFilterDisplayForm({
                  ...payload,
                  tabLocalIdentifier: payload.tabLocalIdentifier ?? sourceTabLocalIdentifier,
              })
            : tabsActions.addAttributeFilterDisplayForm({
                  displayForm: payload,
                  tabLocalIdentifier: sourceTabLocalIdentifier,
              });
    }
    const payload = (action as PayloadAction<MaybeTabTargetedPayload>).payload;
    if (payload?.tabLocalIdentifier) {
        return action;
    }
    return { ...action, payload: { ...payload, tabLocalIdentifier: sourceTabLocalIdentifier } } as Action;
}

/**
 * The tabs slice reducer ignores batch actions, which the store unpacks, so planning
 * works on their inner actions.
 */
function unbatched(action: Action): Action[] {
    return action.type === BATCH ? (action as BatchAction).payload.flatMap(unbatched) : [action];
}
