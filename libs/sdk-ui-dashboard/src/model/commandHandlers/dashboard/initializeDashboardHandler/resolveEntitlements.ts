// (C) 2023-2025 GoodData Corporation
import { type IEntitlementDescriptor } from "@gooddata/sdk-model";

import { type InitializeDashboard } from "../../../commands/dashboard.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

export function resolveEntitlements(
    ctx: DashboardContext,
    cmd: InitializeDashboard,
): Promise<IEntitlementDescriptor[]> {
    const { entitlements } = cmd.payload?.config ?? {};

    if (entitlements) {
        return Promise.resolve(entitlements);
    }

    const { backend } = ctx;

    return backend.entitlements().resolveEntitlements();
}
