// (C) 2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";

import { type IDashboardAttributeFilterConfig } from "@gooddata/sdk-model";

import { type CrossFilteringLocalIdsByTab } from "../../../store/tabs/filterContext/filterSync.js";
import { type ITabState, type ITabsState } from "../../../store/tabs/tabsState.js";

/**
 * Everything the tab sync planner needs to know about the command being handled.
 * Built once per command by {@link beginTabSync}.
 *
 * @internal
 */
export interface ITabSyncScope {
    /**
     * False when filters are not persisted across tabs, or when the handler opts out
     * for this command (e.g. cross-filtering virtual filters). Nothing is mirrored then.
     */
    readonly enabled: boolean;
    /**
     * Tab the command was issued on. Synced actions without `tabLocalIdentifier` in their payload
     * are addressed to this tab; the active tab is used when undefined.
     */
    readonly sourceTabLocalIdentifier: string | undefined;
    /**
     * Cross-filtering virtual filters, which are never mirrored to or from other tabs.
     */
    readonly crossFilteringLocalIdsByTab: CrossFilteringLocalIdsByTab;
    /**
     * Attribute filter configs of the saved dashboard keyed by tab local identifier. A tab that is
     * missing has no saved configs, so a reset leaves its display-as labels unchanged.
     */
    readonly persistedAttributeFilterConfigsByTab?: Readonly<
        Record<string, readonly IDashboardAttributeFilterConfig[]>
    >;
}

/**
 * Input of a single tab sync rule.
 *
 * @internal
 */
export interface ITabSyncRuleContext {
    readonly scope: ITabSyncScope;
    /**
     * Tabs state before the source action is applied. Mirrored actions of previous
     * actions in the same batch are already applied.
     */
    readonly state: ITabsState;
    /**
     * Source tab before the source action is applied.
     */
    readonly source: ITabState;
    /**
     * Source tab after the source action is applied.
     */
    readonly sourceAfter: ITabState;
}

/**
 * Translates the payload of an action applied on the source tab into the payload
 * of the same action for `target`. Returns undefined when `target` is left untouched.
 * The planner sets `tabLocalIdentifier` of the returned payload.
 *
 * @internal
 */
export type TabSyncRule<P> = (payload: P, target: ITabState, ctx: ITabSyncRuleContext) => P | undefined;

/**
 * Translates the payload of an action applied on the source tab into the actions that apply it
 * to `target`. Returns an empty array when `target` is left untouched.
 * The planner sets `tabLocalIdentifier` of every returned payload.
 *
 * @internal
 */
export type TabSyncActionsRule<P> = (
    payload: P,
    target: ITabState,
    ctx: ITabSyncRuleContext,
) => PayloadAction<object>[];
