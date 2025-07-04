// (C) 2023-2025 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { IEntitlementDescriptor } from "@gooddata/sdk-model";
import { DashboardSelector, DashboardState } from "../types.js";
import { invariant } from "ts-invariant";
import { ResolvedEntitlements } from "../../types/commonTypes.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.entitlements,
);

/**
 * Returns dashboard's entitlements.
 *
 * @remarks
 * It is expected that the selector is called only after the entitlements state
 * is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectEntitlements: DashboardSelector<ResolvedEntitlements> = createSelector(
    selectSelf,
    (state) => {
        invariant(state.entitlements, "attempting to access uninitialized entitlements state");

        return state.entitlements;
    },
);

/**
 * @alpha
 */
export const selectEntitlementExportPdf: DashboardSelector<IEntitlementDescriptor | undefined> =
    createSelector(selectEntitlements, (entitlements) => {
        return entitlements.find((entitlement) => entitlement.name === "PdfExports");
    });

/**
 * @alpha
 */
export const selectEntitlementMaxAutomationRecipients: DashboardSelector<IEntitlementDescriptor | undefined> =
    createSelector(selectEntitlements, (entitlements) => {
        return entitlements.find((entitlement) => entitlement.name === "AutomationRecipientCount");
    });

/**
 * @alpha
 */
export const selectEntitlementMaxAutomations: DashboardSelector<IEntitlementDescriptor | undefined> =
    createSelector(selectEntitlements, (entitlements) => {
        return entitlements.find((entitlement) => entitlement.name === "AutomationCount");
    });

/**
 * @alpha
 */
export const selectEntitlementUnlimitedAutomations: DashboardSelector<IEntitlementDescriptor | undefined> =
    createSelector(selectEntitlements, (entitlements) => {
        return entitlements.find((entitlement) => entitlement.name === "UnlimitedAutomations");
    });

/**
 * @alpha
 */
export const selectEntitlementMinimumRecurrenceMinutes: DashboardSelector<
    IEntitlementDescriptor | undefined
> = createSelector(selectEntitlements, (entitlements) => {
    return entitlements.find((entitlement) => entitlement.name === "ScheduledActionMinimumRecurrenceMinutes");
});
