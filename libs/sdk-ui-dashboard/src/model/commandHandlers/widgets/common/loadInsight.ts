// (C) 2022-2025 GoodData Corporation
import { type IInsight, type ObjRef } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

export function loadInsight(ctx: DashboardContext, insightRef: ObjRef): Promise<IInsight> {
    return ctx.backend.workspace(ctx.workspace).insights().getInsight(insightRef);
}
