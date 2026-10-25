// (C) 2026 GoodData Corporation

import { type IHeaderPredicate } from "@gooddata/sdk-ui";

/**
 * appState.meta.drillableItems slice state — the header predicates converted from the
 * embedding host's drillable-items command (see sagas/drillable_items_sagas.ts). NOTE: predicates
 * are functions, so this subtree is exempt from serializability by design (embedding protocol).
 */
export type IDrillableItemsState = IHeaderPredicate[];

export const drillableItemsInitialState: IDrillableItemsState = [];
