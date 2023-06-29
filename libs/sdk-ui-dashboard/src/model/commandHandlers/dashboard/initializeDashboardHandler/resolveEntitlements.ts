// (C) 2023 GoodData Corporation
import { IEntitlementDescriptor } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../types/commonTypes.js";

export function resolveEntitlements(ctx: DashboardContext): Promise<IEntitlementDescriptor[]> {
    const { backend } = ctx;

    return backend.entitlements().resolveEntitlements();
}
