// (C) 2023-2025 GoodData Corporation
import { IEntitlementDescriptor } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../types/commonTypes.js";
import { InitializeDashboard } from "../../../commands/dashboard.js";

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
