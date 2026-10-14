// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import {
    insightReferencesFromDashboard,
    insightReferencesFromWidget,
} from "../../utils/insightReferences.js";
import { createMemoizedSelector } from "../_infra/selectors.js";
import { selectPersistedDashboard } from "../meta/metaSelectors.js";
import { selectAllTabsWidgetContexts } from "../tabs/layout/layoutSelectors.js";
import { type DashboardSelector } from "../types.js";

/**
 * Whether the dashboard being edited uses the insight in any working tab or in its saved copy.
 *
 * @internal
 */
export const selectIsInsightUsedByDashboard: (ref: ObjRef) => DashboardSelector<boolean> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(
            selectAllTabsWidgetContexts,
            selectPersistedDashboard,
            (contexts, persistedDashboard) => {
                const used = [
                    ...contexts.flatMap(({ widget }) => insightReferencesFromWidget(widget)),
                    ...(persistedDashboard ? insightReferencesFromDashboard(persistedDashboard) : []),
                ];
                return used.some((usedRef) => areObjRefsEqual(usedRef, ref));
            },
        ),
    );
